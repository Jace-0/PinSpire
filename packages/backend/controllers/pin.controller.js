const redisClient = require('../util/redis');
const { sequelize, Op } = require('../util/db');  
const { validatePinData } = require('../validators/pin.validator');
const { Pin, Like, Comment, CommentReply, User } = require('../models');
const { uploadPin } = require('../util/cloudinary');


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
                    exclude: ['created_at', 'updated_at', 'createdAt', 'updatedAt']
                },
                attributes: {
                    include: [
                        [
                            sequelize.literal(`(
                                SELECT COUNT(*)
                                FROM likes
                                WHERE likes.likeable_id = "Pin"."id"
                            )`),
                            'like_count'
                        ],
                        [
                            sequelize.literal(`(
                                SELECT COUNT(*)
                                FROM comments
                                WHERE comments.pin_id = "Pin"."id"
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
            console.log('TRIGGERED')
            const userId = req.user.id;
            const pinData = req.body;
            const pinImage = req.file;

            console.log('PinData', pinData);
            


            if (!pinImage) {
                return res.status(400).json({
                    success: false,
                    message: 'Pin image is required'
                });
            }

            const pinUrl = await uploadPin(pinImage);

            console.log('PinUrl', pinUrl);

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
                image_url: pinUrl,
                user_id: userId
            });

            // Invalidate related caches
            await Promise.all([
                redisClient.del(`user:${userId}:pins`),    // User's pins list
                redisClient.del('pins:recent'),            // Recent pins list
            ]);

            // Get pin with associations
            const pinWithDetails = await Pin.findByPk(pin.id, {
                attributes: {
                    exclude: ['created_at', 'updated_at', 'createdAt', 'updatedAt']
                },
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
            attributes: {
                exclude: ['created_at', 'updated_at', 'createdAt', 'updatedAt']
            },
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
      },

    getAllPins : async (req, res) => {
        try {
            // Get cursor (last pin id from previous fetch)
            const { cursor, limit = 20 } = req.query;

            console.log('Cusor', cursor)

            // Build query
            const query = {
                attributes: {
                    exclude: ['created_at', 'updated_at', 'createdAt', 'updatedAt']
                },
                include: [{
                    model: User,
                    as: "user",
                    attributes: ["id", "username", "avatar_url"],
                }],
                order: [["created_at", "DESC"]],
                limit: parseInt(limit)
            };

            if (cursor && cursor !== 'null' && cursor !== 'undefined') {
                const cursorDate = new Date(cursor);
                if (!isNaN(cursorDate.getTime())) {
                    query.where = {
                        created_at: {
                            [Op.lt]: cursorDate
                        }
                    };
                }
            }

            const pins = await Pin.findAll(query);

            // Get last pin's timestamp for next cursor
            const lastPin = pins[pins.length - 1];        // Get last pin from current batch
            const nextCursor = lastPin ? lastPin.created_at : null;  // Get its timestamp


        return res.status(200).json({
            success: true,
            data: pins,
            nextCursor,
            hasMore: pins.length === parseInt(limit)
        });
    } catch (error) {
        console.error("Error fetching user pins:", error);
        return res.status(500).json({
        success: false,
        message: `Error: ${error.message || 'Internal server error'}`
        });
    }

    },

    addComment : async (req, res) => {
        
    try{
        const userId = req.user.id
        const pinId = req.params.id
        const { content } = req.body

         // Validate content
         if (!content || content.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Comment content is required'
            });
        }

        // Check if pin exists
        const pin = await Pin.findByPk(pinId);
        if (!pin) {
            return res.status(404).json({
                success: false,
                message: 'Pin not found'
            });
        }

        // Create comment 
        const comment = await Comment.create({
            pin_id: pinId,
            user_id: userId,
            content: content.trim()
        });
        
        // Invalidate related Redis caches
        await Promise.all([
            redisClient.del(`pin:${pinId}`),
            redisClient.del(`pin:${pinId}:comments`)
        ]);

        // Get comment with user details
        const commentWithUser = await Comment.findOne({
            where: { id: comment.id },
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'username', 'avatar_url']
            }]
        });


        return res.status(201).json({
            success: true,
            data: commentWithUser,
            message: 'Comment added '
        })


        } catch (error) {
            console.error('Error adding comment:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to add comment'
            })
        }
    },

    likePin: async (req, res) => {
        try {
            const userId = req.user.id;
            const pinId = req.params.id;
    
            // Check if pin exists
            const pin = await Pin.findByPk(pinId);
            if (!pin) {
                return res.status(404).json({
                    success: false,
                    message: 'Pin not found'
                });
            }
    
            // Check if user already liked the pin
            const existingLike = await Like.findOne({
                where: {
                    user_id: userId,
                    likeable_id: pinId
                }
            });
    
            if (existingLike) {
                // Unlike if already liked
                await existingLike.destroy();
                
                // Invalidate cache
                await redisClient.del(`pin:${pinId}`);
    
                return res.status(200).json({
                    success: true,
                    liked: false,
                    message: 'Pin unliked successfully'
                });
            }
    
            // Create new like
            await Like.create({
                user_id: userId,
                likeable_id: pinId,
                likeable_type: 'pin'
            });
    
            // Invalidate cache
            await redisClient.del(`pin:${pinId}`);
    
            return res.status(200).json({
                success: true,
                liked: true,
                message: 'Pin liked successfully'
            });
    
        } catch (error) {
            console.error('Error liking pin:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to like pin'
            });
        }
    }
}

module.exports = pinController;