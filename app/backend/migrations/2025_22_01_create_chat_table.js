const { DataTypes, Sequelize } = require('sequelize');

module.exports = {
    up: async ({ context: queryInterface }) => {
        await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

        await  queryInterface.createTable('chat', {
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: Sequelize.literal('uuid_generate_v4()')
              },
              user1_id: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                  model: 'users',
                  key: 'id'
                }
              },
              user2_id: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                  model: 'users',
                  key: 'id'
                }
              },
              last_message_at: {
                type: DataTypes.DATE
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
        await queryInterface.dropTable('chat')
    }
}