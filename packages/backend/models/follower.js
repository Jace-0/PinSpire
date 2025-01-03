const { Model, DataTypes } = require('sequelize');

class Follower extends Model {
    static init(sequelize) {
        super.init({
            follower_id: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onDelete: 'CASCADE',
                primaryKey: true
            },
            following_id: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onDelete: 'CASCADE',
                primaryKey: true
            },
            created_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
                allowNull: false
            }
        }, {
            sequelize,
            tableName: 'followers',
            timestamps: false,
            underscored: true
        });

        return this;
    }
}

module.exports = Follower;