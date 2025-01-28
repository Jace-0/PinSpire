// controllers/user.controller.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const redisClient = require('../util/redis');
const { uploadImage } = require('../util/cloudinary');
const { User, Follower } = require('../models/index');
const { sequelize, Op } = require('../util/db');  

const userController = {
    // user controller
    getUserById: async (req, res) => {
        try {

            const userId = req.params.id
            
             // Find user by ID
            const user = await User.findById(userId)
            // .select('-password') // Exclude password from response
            // .lean(); // Convert to plain JS object

            // Check if user exists
            if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
            }

            // Cache user data in Redis for future requests
            await redisClient.setEx(`user:${userId}`, 3600, JSON.stringify(user));

            return res.status(200).json({
            success: true,
            data: user
            });

        } catch (error) {
            console.error('Error fetching user:', error);
            return res.status(500).json({
            success: false,
            message: 'Internal server error'
            });
        }
    },

    getUserByUsername: async (req, res) => {
        try {
            const username = req.params.username
            
             // Find user by ID
            const user = await User.findByUsername(username)
            // .select('-password') // Exclude password from response
            // .lean(); // Convert to plain JS object

            // Check if user exists
            if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
            }

            // Cache user data in Redis for future requests
            await redisClient.setEx(`user:${username}`, 3600, JSON.stringify(user));

            return res.status(200).json({
            success: true,
            data: user
            });

        } catch (error) {
            console.error('Error fetching user:', error);
            return res.status(500).json({
            success: false,
            message: 'Internal server error'
            });
        }
    },

    // Update user by ID
  updateUser: async (req, res) => {
    try {
      const userId = req.params.id;
      const updates = req.body;

      // Remove sensitive fields from updates
      delete updates.password;
      delete updates.email; // Prevent email changes through this endpoint
      delete updates.avatar_url;

      // Perform update
      const [updated] = await User.update(updates, {
        where: { id: userId },
        returning: true
      })

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Get updated user data
      const updatedUser = await User.findByPk(userId, {
        attributes: { 
          exclude: ['password_hash'] 
        }
      });

      // Invalidate Redis cache
      await redisClient.del(`user:${userId}`);

      return res.status(200).json({
        success: true,
        data: updatedUser
      });

    } catch (error) {
      console.error('Error updating user:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

// Separate endpoint for avatar updates
  updateAvatar: async (req, res) => {
    try {
        const userId = req.params.id;        
        const file = req.file;

        if (!file) {
            return res.status(400).json({
                success: false,
                message: 'No image file provided'
            });
        }


        // Upload to Cloudinary
        const imageUrl = await uploadImage(file);

        // Update user's avatar_url
        const [updated] = await User.update({
            avatar_url: imageUrl
        }, {
            where: { id: userId },
            returning: true
        });

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get updated user data
        const updatedUser = await User.findByPk(userId, {
            attributes: { 
                exclude: ['password_hash'] 
            }
        });

        // Invalidate Redis cache
        await redisClient.del(`user:${userId}`);

        return res.status(200).json({
            success: true,
            data: updatedUser
        });
    } catch (error) {
        console.error('Error updating avatar:', error);
        return res.status(500).json({
            success: false,
            message: 'Error updating avatar'
        });
    }
  },

  followUser: async (req, res) => {
    try {
      const userId = req.user.id;
      const followingId = req.params.id; // ID of user to follow
  
      const existingFollow = await Follower.findOne({
        where: {
          follower_id: userId, 
          following_id: followingId
        }
      });
      
  
      if (existingFollow) {
        // unfollow if already followed
        await existingFollow.destroy()
        return res.status(200).json({ message: 'Successfully unfollowed ' });
      }
  
      await Follower.create({
        follower_id: userId, // ID of the user who is following (the current user)
        following_id: followingId //  ID of the user being followed
      });

      
      // Follow Notification
      if (followingId && followingId !== userId && req.app.ws) {
        req.app.ws.sendNotification(followingId, {
            type: 'notification',
            data: {
                type: 'Follow',
                content: {
                    username: req.user.username,
                }
            }
        });
    }
  
      res.status(200).json({ message: 'Successfully followed ' });
    } catch (error) {
      res.status(500).json({ message: 'Error following user', error: error.message });
    }
  },

  checkFollowStatus: async (req, res) => {
    try {
      const userId = req.user.id
      const profileId = req.params.id

      const existingFollow = await Follower.findOne({
        where: {
          follower_id: userId,
          following_id: profileId
        }
      })

      res.json({ isFollowing: !!existingFollow })
    } catch (error) {
      res.status(500).json({ message: 'Error checking follow status', error: error.message })
    }
  },

  searchUsers: async (req, res) => {
    try {
      const { username } = req.query;
      
      if (!username?.trim()) {
          return res.status(400).json({
              success: false,
              message: 'Search term is required'
          });
      }

      // Find users with similar usernames using ILIKE and pattern matching
      const users = await User.findAll({
          where: {
              [Op.or]: [
                  // Match username containing the search term
                  { username: { [Op.iLike]: `%${username}%` } }
              ]
          },
          attributes: ['id', 'first_name', 'last_name', 'username', 'avatar_url'],
          order: [
              // Exact matches first, then partial matches
            [sequelize.literal(`username ILIKE '${username}%'`), 'DESC'],
            ['username', 'ASC']
          ]
      });

      // Format response
      const formattedUsers = users.map(user => ({
          id: user.id,
          username: user.username,
          name: `${user.first_name} ${user.last_name}`,
          avatar_url: user.avatar_url
      }));


      return res.status(200).json({
          success: true,
          data: formattedUsers
      });

  } catch (error) {
      console.error('Search error:', error);
      return res.status(500).json({
          success: false,
          message: 'Error searching users'
      });
  }
  }
}


module.exports = userController;