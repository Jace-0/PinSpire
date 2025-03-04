const { DataTypes, Sequelize } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.createTable('comments', {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('uuid_generate_v4()')
      },
      pin_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'pins',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      parent_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'comments',
          key: 'id'
        },
        onDelete: 'CASCADE',
        comment: 'ID of parent comment if this is a reply'
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      mentioned_users: {
        type: DataTypes.ARRAY(DataTypes.UUID),
        defaultValue: [],
        comment: 'Array of user IDs mentioned in the comment'
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

    await queryInterface.addIndex('comments', ['mentioned_users'], {
      using: 'gin',
      name: 'idx_comment_mentioned_users'
    })

  },

  down: async ({ context: queryInterface }) => {
    // Then drop the table
    await queryInterface.dropTable('comments')
  }
}