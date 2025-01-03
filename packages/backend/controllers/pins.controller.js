const redisClient = require('../util/redis');
const { sequelize } = require('../util/db');  
const { validatePinData } = require('../validators/pin.validator');
const { Pin, Like, Comment, CommentReply, User } = require('../models');


const pinController = {
    // pin controller
    getPinById: async (req, res) => {
        try {
            const pinId = req.params.id;

            // Check Redis cache
            const cachedPin = await redisClient.get(`pin:${pinId}`);
            if (cachedPin) {
                return res.status(200).json({
                    success: true,
                    data: JSON.parse(cachedPin)
                });
            }

            // Fetch pin with associations and counts
            const pin = await Pin.findOne({
                where: { id: pinId },
                attributes: {
                    include: [
                        [
                            sequelize.literal(`(
                                SELECT COUNT(*)
                                FROM likes
                                WHERE likes.pin_id = Pin.id
                            )`),
                            'like_count'
                        ],
                        [
                            sequelize.literal(`(
                                SELECT COUNT(*)
                                FROM comments
                                WHERE comments.pin_id = Pin.id
                            )`),
                            'comment_count'
                        ]
                    ]
                }, 
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'username', 'avatar_url']
                    },
                    {
                        model: Like,
                        as: 'likes',
                        separate: true,
                        attributes: ['id', 'user_id'],
                        include: [{
                            model: User,
                            as: 'user',
                            attributes: ['id', 'username', 'avatar_url']
                        }]
                    },
                    {
                        model: Comment,
                        as: 'comments',
                        separate: true,
                        attributes: ['id', 'user_id', 'content', 'created_at'],
                        include: [{
                            model: User,
                            as: 'user',
                            attributes: ['id', 'username', 'avatar_url']
                        },
                        {
                            model: CommentReply,
                            as: 'replies',
                            attributes: ['id', 'user_id', 'content', 'created_at'],
                            include: [{
                                model: User,
                                as: 'user',
                                attributes: ['id', 'username', 'avatar_url']
                            }]
                        }]
                    },
                    
                ],
                order: [
                    ['created_at', 'DESC'],
                    [{ model: Comment, as: 'comments' }, 'created_at', 'DESC'],
                    [{ model: Comment, as: 'comments' }, { model: CommentReply, as: 'replies' }, 'created_at', 'DESC']
                ]
            });

            if (!pin) {
                return res.status(404).json({
                    success: false,
                    message: 'No Pin found'
                });
            }

            // Transform data before caching
            const pinData = pin.toJSON();

            // Not Needed for now

            // // Add additional metadata
            // pinData.metadata = {
            //     cached_at: new Date().toISOString(),
            //     last_updated: pin.updated_at
            // };

            // Cache the transformed data
            await redisClient.setEx(
                `pin:${pinId}`, 
                3600, // 1 hour cache
                JSON.stringify(pinData)
            );

            return res.status(200).json({
                success: true,
                data: pinData
            });

        } catch (error) {
            console.error('Error fetching pin:', error);
            return res.status(500).json({
                success: false,
                message: `Error: ${error.message || 'Internal server error'}`
            });
        }
    },
    createPin: async (req, res) => {
        try {
            const userId = req.user.id;
            const pinData = req.body;

             // Validate pin data
            const { error } = validatePinData(pinData);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid pin data',
                    errors: error.details
                });
            }

            // Create new pin
            const pin = await Pin.create({
                ...pinData,
                user_id: userId
            });

            // Invalidate related caches
            await Promise.all([
                redisClient.del(`user:${userId}:pins`),    // User's pins list
                redisClient.del('pins:recent'),            // Recent pins list
            ]);

            // Get pin with associations
            const pinWithDetails = await Pin.findByPk(pin.id, {
                include: [{
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username', 'avatar_url']
                }]
            });

            return res.status(201).json({
                success: true,
                data: pinWithDetails,
                message: 'Pin created successfully'
            });

        } catch (error) {
            console.error('Error creating pin:', error);
            return res.status(500).json({
                success: false,
                message: `Error: ${error.message || 'Internal server error'}`
            });
        }
    },

    getUserPins : async (req, res) => {
        try {
            const userId = req.user.id;

            // Check cache
            const cachedPins = await redisClient.get(`user:${userId}:pins`);
            if (cachedPins) {
                return res.status(200).json({
                    success: true,
                    data: JSON.parse(cachedPins)
                });
            }
      
          const userPins = await Pin.findAll({
            where: { user_id: userId },
            include: [
              {
                model: User,
                as: "user",
                attributes: ["username", "avatar_url"],
              },
            ],
            order: [["created_at", "DESC"]]
          });

          // Cache the results
            await redisClient.setEx(
                `user:${userId}:pins`,
                3600,
                JSON.stringify(userPins)
            );
      
          return res.status(200).json({
            success: true,
            data: userPins
        });

        } catch (error) {
          console.error("Error fetching user pins:", error);
          return res.status(500).json({
            success: false,
            message: `Error: ${error.message || 'Internal server error'}`
          });
        }
      }
}

module.exports = pinController;