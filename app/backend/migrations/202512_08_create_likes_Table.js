const { DataTypes, Sequelize } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.createTable('likes', {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('uuid_generate_v4()')
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
      likeable_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      likeable_type: {
        type: DataTypes.STRING,
        allowNull: false
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false
      }
    })

    // Add composite unique constraint
    await queryInterface.addConstraint('likes', {
      fields: ['user_id', 'likeable_id', 'likeable_type'],
      type: 'unique',
      name: 'unique_like'
    })

    // Add indexes
    await queryInterface.addIndex('likes', ['likeable_id', 'likeable_type'], {
      name: 'idx_likes_likeable'
    })
  },

  down: async ({ context: queryInterface }) => {
    await queryInterface.dropTable('likes')
  }
}