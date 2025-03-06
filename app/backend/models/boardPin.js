const { Model, DataTypes } = require('sequelize')

class BoardPin extends Model {
  static init(sequelize) {
    super.init({
      board_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'boards',
          key: 'id'
        },
        onDelete: 'CASCADE'
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
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false
      }
    }, {
      sequelize,
      tableName: 'board_pins',
      timestamps: true,
      updatedAt: false,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ['board_id', 'pin_id']
        }
      ],
      hooks: {
        // This hook runs after a pin is added to a board
        afterCreate: async (boardPin, options) => {
          try {
            // console.log('BoardPin afterCreate hook triggered', boardPin.toJSON())

            // Skip if we're explicitly preventing cover image updates
            if (options.updateCoverImage === false) return

            // Get the models we need
            const Board = sequelize.models.Board
            const Pin = sequelize.models.Pin

            if (!Board || !Pin) {
              console.error('Board or Pin model not found in sequelize.models')
              return
            }

            // Find the board and pin
            const board = await Board.findByPk(boardPin.board_id)
            const pin = await Pin.findByPk(boardPin.pin_id)

            // console.log('Found board:', board ? 'Yes' : 'No')
            // console.log('Found pin:', pin ? 'Yes' : 'No')

            // If we found both, update the board's cover image
            if (board && pin && pin.image_url) {
              // console.log('Updating board cover image to:', pin.image_url)
              await board.update(
                { cover_image_url: pin.image_url },
                { updateCoverImage: false } // Prevent the board's own hook from running
              )
              // console.log('Board cover image updated successfully')
            }
          } catch (error) {
            console.error('Error updating board cover image after pin added:', error)
          }
        }
      }
    })
    return this
  }
}

module.exports = BoardPin