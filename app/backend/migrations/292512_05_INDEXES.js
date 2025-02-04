module.exports = {
  up: async ({ context: queryInterface }) => {
    // Add index for pins.user_id
    await queryInterface.addIndex('pins', ['user_id'], {
      name: 'idx_pins_user_id'
    })

    // Add index for boards.user_id
    await queryInterface.addIndex('boards', ['user_id'], {
      name: 'idx_boards_user_id'
    })

    // Add indexes for board_pins
    await queryInterface.addIndex('board_pins', ['board_id'], {
      name: 'idx_board_pins_board_id'
    })
    await queryInterface.addIndex('board_pins', ['pin_id'], {
      name: 'idx_board_pins_pin_id'
    })

  },

  down: async ({ context: queryInterface }) => {
    // Remove all indexes in reverse order
    await queryInterface.removeIndex('board_pins', 'idx_board_pins_pin_id')
    await queryInterface.removeIndex('board_pins', 'idx_board_pins_board_id')
    await queryInterface.removeIndex('boards', 'idx_boards_user_id')
    await queryInterface.removeIndex('pins', 'idx_pins_user_id')
  }
}