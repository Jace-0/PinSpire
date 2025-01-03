const { DataTypes } = require('sequelize');

module.exports = {
    up: async ({ context: queryInterface }) => {
        await queryInterface.addColumn('pins', 'board_id', {
            type: DataTypes.UUID,
            allowNull: true,  
            references: {
                model: 'boards',
                key: 'id'
            },
            onDelete: 'SET NULL'  
        });
    },

    down: async ({ context: queryInterface }) => {
        await queryInterface.removeColumn('pins', 'board_id');
    }
};


/* 
This new structure:

Allows pins to exist without being assigned to a board
Users can create pins and optionally add them to a board later
If a board is deleted, the pins remain but their board_id is set to NULL
Maintains the flexibility of Pinterest's actual behavior where:
Users can create pins without boards
Pins can be added to boards later
Pins can exist independently of boards
Deleting a board doesn't delete its pins
This is more accurate to Pinterest's actual functionality where pins can exist in a user's profile without being assigned to a specific board.
*/