// Migration for board_pins table
const { DataTypes, Sequelize } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.createTable('board_pins', {
      board_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'boards',
          key: 'id'
        },
        onDelete: 'CASCADE',
      },
      pin_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'pins',
          key: 'id'
        },
        onDelete: 'CASCADE',
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false
      }
    })

    // Add composite primary key
    await queryInterface.addConstraint('board_pins', {
      fields: ['board_id', 'pin_id'],
      type: 'primary key',
      name: 'board_pins_pkey'
    })
  },

  down: async ({ context: queryInterface }) => {
    await queryInterface.dropTable('board_pins')
  }
}