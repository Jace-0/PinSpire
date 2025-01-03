const { Model, DataTypes } = require('sequelize');

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
            content: {
                type: DataTypes.TEXT,
                allowNull: false,
                validate: {
                    notEmpty: true
                }
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
        });

        return this;
    }
}

module.exports = Comment;