const { sequelize, Op } = require('../util/db');  
const { Chat, Message, User } = require('../models');


const chatController = {
    getUserChats: async (req, res) => {
        try {
          const userId = req.user.id;
          const chats = await Chat.findAll({
            where: {
              [Op.or]: [
                { user1_id: userId },
                { user2_id: userId }
              ]
            },
            include: [
              {
                model: Message,
                limit: 1,
                order: [['created_at', 'DESC']],
              },
              {
                model: User,
                as: 'user1',
                attributes: ['id', 'username', 'avatar_url', 'first_name', 'last_name'],
              },
              {
                model: User,
                as: 'user2',
                attributes: ['id', 'username', 'avatar_url', 'first_name', 'last_name'],
              }
            ],
            order: [['last_message_at', 'DESC']]
          });
    
          // Format chats for frontend
          const formattedChats = chats.map(chat => ({
            id: chat.id,
            otherUser: chat.user1_id === userId ? chat.user2 : chat.user1,
            lastMessage: chat.messages[0],
            updatedAt: chat.last_message_at
          }));
    
          res.json(formattedChats);
        } catch (error) {
          console.error('Error getting chats:', error);
          res.status(500).json({ error: 'Failed to get chats' });
        }
      },

      getChatMessages: async (req, res) => {
        try {
          const { chatId } = req.params;
          const userId = req.user.id;

    
          // Verify user is part of this chat
          const chat = await Chat.findOne({
            where: {
              id: chatId,
              [Op.or]: [
                { user1_id: userId },
                { user2_id: userId }
              ]
            }
          });

          console.log('If Chat', chat)
    
          if (!chat) {
            return res.status(403).json({ error: 'Not authorized to access this chat' });
          }
    
          const messages = await Message.findAll({
            where: { chat_id: chatId },
            // attributes: {
            //     exclude: ["sender_id"]
            //   },
            include: [
                {
                  model: User,
                  as: 'sender',
                  attributes: ['id', 'username', 'avatar_url'],
                },
            ],
            order: [['created_at', 'ASC']]
          });
    
          res.status(200).json(messages);
        } catch (error) {
          console.error('Error getting messages:', error);
          res.status(500).json({ error: 'Failed to get messages' });
        }
      },

      createChat: async (req, res) => {
        try {
          const { otherUserId } = req.body;
          const userId = req.user.id;

          console.log('User', userId, 'otherUserId', otherUserId)
    
          // Check if chat already exists
          const existingChat = await Chat.findOne({
            where: {
              [Op.or]: [
                {
                  user1_id: userId,
                  user2_id: otherUserId
                },
                {
                  user1_id: otherUserId,
                  user2_id: userId
                }
              ]
            }
          });

          console.log('Existing Chat:', JSON.stringify(existingChat, null, 2));
    
          if (existingChat) {
            return res.json(existingChat);
          }
    
          // Create new chat
          const chat = await Chat.create({
            user1_id: userId,
            user2_id: otherUserId
          });

          console.log('New Chat:', JSON.stringify(chat));
    
          res.status(201).json(chat);
        } catch (error) {
          console.error('Error creating chat:', error);
          res.status(500).json({ error: 'Failed to create chat' });
        }
      },

    sendMessage: async (req, res) => {
        try {
            const userId = req.user.id
            const { chat_id, content } = req.body

            // check if chat exist
            const chatExist = await Chat.findOne({
                where: {
                    id: chat_id,
                    [Op.or]: [
                        { user1_id: userId },
                        { user2_id: userId }
                    ]
                }
            })
    
            if (!chatExist) {
                return res.status(404).json({
                    success: false,
                    message: 'Chat not found or you are not a participant'
                });
            }

            // Create message with transaction
            const message = await sequelize.transaction(async (t) => {
                const newMessage = await Message.create({
                    chat_id: chatExist.id,
                    sender_id: userId,
                    content: content.trim(),
                    status: 'sent'
                }, { transaction: t });

                // Update chat's last_message_at
                await Chat.update(
                    { last_message_at: new Date() },
                    { 
                        where: { id: chat_id },
                        transaction: t 
                    }
                )
                return newMessage

            });
            
           // Send WebSocket message
            req.app.ws.sendChatMessage(
              { 
                user1_id: chatExist.user1_id, 
                user2_id: chatExist.user2_id 
              },
              message
            );

            res.status(201).json({
              success: true,
              message: 'Message sent successfully',
              data: message
            });

        } catch (error) {
            console.error('Error Sending Message:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to send message',
                error: error
            });
          }
    }

};

module.exports = chatController;
