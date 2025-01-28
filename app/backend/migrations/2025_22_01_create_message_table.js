const { DataTypes, Sequelize } = require('sequelize');

module.exports = {
    up: async ({ context: queryInterface }) => {
        await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

        await queryInterface.createTable('message', {
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: Sequelize.literal('uuid_generate_v4()')
              },
              chat_id: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                  model: 'chat',
                  key: 'id'
                }
              },
              sender_id: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                  model: 'users',
                  key: 'id'
                }
              },
              content: {
                type: DataTypes.TEXT,
                allowNull: false
              },
              status: {
                type: DataTypes.ENUM('sent', 'delivered', 'read'),
                defaultValue: 'sent'
              },
              created_at: {
                  type: DataTypes.DATE,
                  defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                  allowNull: false
              },
              updated_at: {
                  type: DataTypes.DATE,
                  defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                  allowNull: false
              }
        })

    },
    down: async ({ context: queryInterface }) => {
        queryInterface.dropTable('message')
    }
}