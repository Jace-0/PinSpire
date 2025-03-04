const { Model, DataTypes } = require('sequelize')

class Comment extends Model {
  static init(sequelize) {
    super.init({
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
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
      parent_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'comments',
          key: 'id'
        },
        onDelete: 'CASCADE',
        comment: 'ID of parent comment if this is a reply'
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      mentioned_users: {
        type: DataTypes.ARRAY(DataTypes.UUID),
        defaultValue: [],
        comment: 'Array of user IDs mentioned in the comment'
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
      tableName: 'comments',
      timestamps: true,
      underscored: true
    })

    return this
  }
}

module.exports = Comment