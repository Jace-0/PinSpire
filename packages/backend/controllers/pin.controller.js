const redisClient = require('../util/redis');
const { sequelize, Op } = require('../util/db');  
const { validatePinData } = require('../validators/pin.validator');
const { Pin, Like, Comment, CommentReply, User } = require('../models');
const { uploadPin } = require('../util/cloudinary');

const CACHE_KEYS = {
    pin: (id) => `pin:${id}`,
    userPins: (userId) => `user:${userId}:pins`,
    allPins : (cursor, limit) =>  `pins:${cursor || 'latest'}:${limit}`,
    recentPins: 'pins:recent'
  }

const CACHE_TTL = {
    PIN: 3600,          // 1 hour
    USER_PINS: 3600,    // 1 hour
    RECENT_PINS: 1800   // 30 minutes
}

const pinController = {
    // pin controller
    getPinById: async (req, res) => {
        try {
            const pinId = req.params.id;
            const cacheKey = CACHE_KEYS.pin(pinId)

            // Check Redis cache
            const cachedData = await redisClient.get(`pin:${cacheKey}`);
            if (cachedData) {
                return res.status(200).json({
                    success: true,
                    data: JSON.parse(cachedData),
                    source: 'cache'
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
                                FROM "likes"
                                WHERE "likeable_id" = "Pin"."id"
                            )`),
                            'like_count'
                        ],
                        [
                            sequelize.literal(`(
                                SELECT COUNT(*)
                                FROM "comments"
                                WHERE "pin_id" = "Pin"."id"
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
                        attributes: {
                            include: [
                                [
                                    sequelize.literal(`(
                                        SELECT COUNT(*)
                                        FROM "likes"
                                        WHERE "likeable_id" = "comments"."id" 
                                        AND "likeable_type" = 'comment'
                                    )`),
                                    'likes_count'
                                ]
                            ]
                        },
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
                // Cache negative result with shorter TTL
                await redisClient.setEx(cacheKey, 300, JSON.stringify(null))
                return res.status(404).json({
                    success: false,
                    message: 'No Pin found'
                });
            }

            // Transform data before caching
            const pinData = pin.toJSON();


            // Cache with metadata, NOT USED NOW 
            const cacheData = {
                data: pinData,
                metadata: {
                    cached_at: new Date().toISOString(),
                    expires_at: new Date(Date.now() + CACHE_TTL.PIN * 1000).toISOString()
                }
            }

            await redisClient.setEx(
                cacheKey,
                CACHE_TTL.PIN,
                JSON.stringify(cacheData)
            )

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
            const pinImage = req.file;


            if (!pinImage) {
                return res.status(400).json({
                    success: false,
                    message: 'Pin image is required'
                });
            }

            const pinUrl = await uploadPin(pinImage);

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
            const cacheKey = CACHE_KEYS.userPins(userId)

            // Check cache
            const cachedData = await redisClient.get(cacheKey);
            if (cachedData) {
                return res.status(200).json({
                    success: true,
                    data: JSON.parse(cachedData),
                    source: 'cache'
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
                cacheKey,
                CACHE_TTL.USER_PINS,
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
            const cacheKey = CACHE_KEYS.allPins(cursor, limit)

            //Check catch 
            const cachedData = await redisClient.get(cacheKey)
            if (cachedData) {
                const parsed = JSON.parse(cachedData)
                return res.status(200).json({
                    success: true,
                    ...parsed.data,
                    metadata: parsed.metadata,
                    source: 'cache'
                })
            }

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

            const responseData = {
                pins,
                nextCursor,
                hasMore: pins.length === parseInt(limit)
            }


            // Cache with metadata
            const cacheData = {
                data: responseData,
                metadata: {
                    cached_at: new Date().toISOString(),
                    expires_at: new Date(Date.now() + 900 * 1000).toISOString() // 15 minutes
                }
            }

             // Shorter TTL for paginated data
            await redisClient.setEx(cacheKey, 900, JSON.stringify(cacheData))

            return res.status(200).json({
                success: true,
                ...responseData,
                source: 'database'
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
            redisClient.del(`pin:${pinId}`)
            // redisClient.del(`pin:${pinId}:comments`)
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
    },

    replyComment: async (req, res) => {
        try {
            const userId = req.user.id;
            const commentId = req.params.commentId; // From URL params
            const { content } = req.body;
    
            // Validate content
            if (!content?.trim()) {
                return res.status(400).json({
                    success: false,
                    message: 'Reply content is required'
                });
            }
    
            // Check if comment exists
            const comment = await Comment.findByPk(commentId);
            if (!comment) {
                return res.status(404).json({
                    success: false,
                    message: 'Comment not found'
                });
            }
    
            // Create reply
            const reply = await CommentReply.create({
                comment_id: commentId,
                user_id: userId,
                content: content.trim()
            });
    
            // Invalidate cache
            await redisClient.del(`pin:${comment.pin_id}`);
    
            // Get reply with user details
            const replyWithUser = await CommentReply.findOne({
                where: { id: reply.id },
                include: [{
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username', 'avatar_url']
                }]
            });
    
            return res.status(201).json({
                success: true,
                data: replyWithUser,
                message: 'Reply added successfully'
            });
    
        } catch (error) {
            console.error('Error adding reply:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to add reply'
            });
        }
    },

    likeComment: async (req, res) => {
        try {
            const userId = req.user.id
            const commentId = req.params.commentId;
    
            // Check if comment exists
            const comment = await Comment.findByPk(commentId);
            if (!comment) {
                return res.status(404).json({
                    success: false,
                    message: 'Comment not found'
                });
            }
    
            // Check if user already liked the comment
            const existingLike = await Like.findOne({
                where: {
                    user_id: userId,
                    likeable_id: commentId,
                    likeable_type: 'comment'
                }
            });
    
            if (existingLike) {
                // Unlike if already liked
                await existingLike.destroy();
                
                // Invalidate cache
                await redisClient.del(`pin:${comment.pin_id}`)
    
                return res.status(200).json({
                    success: true,
                    liked: false,
                    message: 'Pin unliked successfully'
                });
            }
    
            // Create new like
            await Like.create({
                user_id: userId,
                likeable_id: commentId,
                likeable_type: 'comment'
            });
    
            // Invalidate cache
            await redisClient.del(`pin:${comment.pin_id}`)
;
    
            return res.status(200).json({
                success: true,
                liked: true,
                message: 'Comment liked successfully'
            });
    
        } catch (error) {
            console.error('Error liking Comment:', error);
            return res.status(500).json({
                success: false,
                message: `Error: ${error.message || 'Internal server error'}`
            });
        }
    }
}

module.exports = pinController;