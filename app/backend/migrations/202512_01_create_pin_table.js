const { DataTypes, Sequelize } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    // Enable UUID extension first (if not already enabled)
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";')

    await queryInterface.createTable('pins', {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
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
      title: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      image_url: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      external_url: {
        type: DataTypes.STRING(255),
        allowNull: true
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
    await queryInterface.dropTable('pins')
  }
}