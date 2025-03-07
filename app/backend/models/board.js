const logger = require('../util/logger')
const { Model, DataTypes } = require('sequelize')

class Board extends Model {
  static init(sequelize) {
    super.init({
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
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
      name: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      cover_image_url: {
        type: DataTypes.STRING(2048),
        allowNull: true,
        defaultValue: 'https://res.cloudinary.com/dafezeyjh/image/upload/v1741088708/Solid_Silver_Gray_a2uhza.jpg'
      },
      is_private: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false
      }
    }, {
      sequelize,
      tableName: 'boards',
      timestamps: true,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ['user_id', 'name']
        }
      ],
    })
    return this // Returns the Pin class itself
  }

  async updateCoverImage(pinId = null) {
    try {
      const Pin = this.sequelize.models.Pin

      // If pinId is provided, use that specific pin
      if (pinId) {
        const pin = await Pin.findByPk(pinId)
        if (pin && pin.image_url) {
          await this.update(
            { cover_image_url: pin.image_url },
            { updateCoverImage: false }
          )
          return true
        }
      }

      // Otherwise, find the latest pin
      const latestPin = await this.getPins({
        order: [['created_at', 'DESC']],
        limit: 1
      })

      if (latestPin && latestPin.length > 0 && latestPin[0].image_url) {
        await this.update(
          { cover_image_url: latestPin[0].image_url },
          { updateCoverImage: false }
        )
        return true
      }

      return false
    } catch (error) {
      logger.error('Error in updateCoverImage:', error)
      return false
    }
  }
}

module.exports = Board