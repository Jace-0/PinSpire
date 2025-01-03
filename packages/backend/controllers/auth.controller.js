// controllers/auth.controller.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const redisClient = require('../util/redis');
const User = require('../models/user');
const { generateInitialAvatar } = require('../util/cloudinary');


const generateUsername = async (email) => {
    // Get base username from email (before @)
    let baseUsername = email.split('@')[0];
    // Remove special characters and spaces
    baseUsername = baseUsername.replace(/[^a-zA-Z0-9]/g, '');
    
    let username = baseUsername;
    let counter = 1;
    
    // Check if username exists, if so, add number until unique
    while (await User.findOne({ where: { username } })) {
        username = `${baseUsername}${counter}`;
        counter++;
    }
    
    return username;
};

const authController = {

    // Login controller
    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            const user = await User.findByEmail(email);
            
            // verify user and password
            if (!user || !(await bcrypt.compare(password, user.password_hash))) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Generate both tokens
            const accessToken = jwt.sign(
                { id: user.id, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }  // Short lived
            );
            
            const refreshToken = jwt.sign(
                { id: user.id },
                process.env.REFRESH_SECRET,
                { expiresIn: '7d' }  // Longer lived
            );

            // Cache user data
            await redisClient.set(
                `user_${user.id}`,
                JSON.stringify(user),
                { EX: 3600 } // expires in 1 hour
            );

            // Update last login
            await user.updateLastLogin();

            res.json({
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username
                },
                accessToken,
                refreshToken
            });

        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Signup controller
    signup: async (req, res) => {
        try  {
            const { email, password, dob} = req.body
    
             // Validate required fields
             if (!email || !password || !dob) {
                return res.status(400).json({
                    error: 'Email, password and date of birth are required'
                });
            }
    
            // Check if email already exists
            const existingUser = await User.findOne({
                where: { email }
            });
    
            if (existingUser) {
                return res.status(400).json({
                    error: 'Email already exists'
                });
            }
            // const existingUser = await User.findOne({
            //     where: {
            //         [Op.or]: [{ email }, { username }]
            //     }
            // });
    
            // Generate unique username from email
            const username = await generateUsername(email);
    
            const avatarUrl = await generateInitialAvatar(username);

    
            // Hash password
            const password_hash = await bcrypt.hash(password, 10);
    
            // Create user
            const user = await User.create({
                email,
                username,
                password_hash,
                dob,
                avatar_url: avatarUrl,
                is_active: true
            });
        
           // Generate both tokens
           const accessToken = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }  // Short lived
        );
        
            const refreshToken = jwt.sign(
                { id: user.id },
                process.env.REFRESH_SECRET,
                { expiresIn: '7d' }  // Longer lived
            );
    
            // Cache user data
            await redisClient.set(
                `user_${user.id}`,
                JSON.stringify(user),
                { EX: 3600 }
            );
    
            res.json({
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username
                },
                accessToken,
                refreshToken
            });

        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Refresh token controller
    refreshToken: async (req, res) => {
        try {
            const { refreshToken } = req.body;
            
            // Verify refresh token
            const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
            
            // Check if token is blacklisted
            const isBlacklisted = await redisClient.get(`bl_${refreshToken}`);
            if (isBlacklisted) {
                throw new Error('Token has been revoked');
            }

             // 3. Generate new tokens
        const newAccessToken = jwt.sign(
            { id: decoded.id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        const newRefreshToken = jwt.sign(
            { id: decoded.id },
            process.env.REFRESH_SECRET,
            { expiresIn: '7d' }
        );

        // 4. Blacklist the old refresh token
        await redisClient.set(
            `bl_${refreshToken}`,
            'true',
            { EX: 7 * 24 * 60 * 60 } // Same as refresh token expiry
        );

        res.json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        });
        
        } catch (error) {
            res.status(401).json({ error: 'Invalid refresh token' });
        }
    },
    
     // Logout controller
     logout: async (req, res) => {
        try {
            const token = req.header('Authorization').replace('Bearer ', '');
            
            // Blacklist the token
            await redisClient.set(
                `bl_${token}`,
                'true',
                { EX: 3600 }
            );

            res.json({ message: 'Logged out successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = authController;