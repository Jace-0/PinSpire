const { Model, DataTypes } = require('sequelize')

class Message extends Model {

  static init(sequelize) {

    super.init({
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
      },
      chat_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'chat',
          key: 'id'
        },
        index: true
      },
      sender_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        index: true
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('sent', 'delivered', 'read'),
        defaultValue: 'sent'
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
      modelName: 'message',
      tableName: 'message',
      indexes: [
        // Composite index for common queries
        {
          fields: ['chat_id', 'created_at'],
          name: 'chat_messages_timestamp_idx'
        },
        // Index for sender queries
        {
          fields: ['sender_id'],
          name: 'message_sender_idx'
        }
      ]
    }
    )
    return this
  }
}

module.exports = Message
