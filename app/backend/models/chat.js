const { Model, DataTypes } = require('sequelize')

class Chat extends Model {

  static init(sequelize) {
    super.init({
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
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
      underscored: true,
      timestamps: true,
      modelName: 'chat',
      tableName: 'chat',
      indexes: [
        // Index for finding chats between two users
        {
          unique: true,
          fields: ['user1_id', 'user2_id'],
          name: 'unique_users_chat'
        }
      ]

    })

    return this
  }
}

module.exports = Chat
