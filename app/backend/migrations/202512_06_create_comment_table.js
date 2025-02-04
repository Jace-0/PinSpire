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
      content: {
        type: DataTypes.TEXT,
        allowNull: false
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

    // Add indexes for better query performance
    await queryInterface.addIndex('comments', ['pin_id'], {
      name: 'idx_comments_pin_id'
    })

    await queryInterface.addIndex('comments', ['user_id'], {
      name: 'idx_comments_user_id'
    })
  },

  down: async ({ context: queryInterface }) => {
    // Remove indexes first
    await queryInterface.removeIndex('comments', 'idx_comments_pin_id')
    await queryInterface.removeIndex('comments', 'idx_comments_user_id')

    // Then drop the table
    await queryInterface.dropTable('comments')
  }
}