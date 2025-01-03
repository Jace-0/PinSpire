const models = require(".");

class CommentReply extends Model {
    static init(sequelize) {
        super.init({
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4
            },
            comment_id: {
                type: DataTypes.UUID,
                allowNull: false
            },
            user_id: {
                type: DataTypes.UUID,
                allowNull: false
            },
            content: {
                type: DataTypes.TEXT,
                allowNull: false
            },
            created_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW
            },
            updated_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW
            }
        }, {
            sequelize,
            tableName: 'comment_replies',
            timestamps: true,
            underscored: true
        });

        return this;
    }
}

module.exports = CommentReply;