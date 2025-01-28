const { Model, DataTypes } = require('sequelize');

class Like extends Model {
    static init(sequelize) {
        super.init({
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4
            },
            user_id: {
                type: DataTypes.UUID,
                allowNull: false
            },
            likeable_id: {
                type: DataTypes.UUID,
                allowNull: false
            },
            likeable_type: {
                type: DataTypes.STRING,
                allowNull: false
            },
            created_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW
            }
        }, {
            sequelize,
            tableName: 'likes',
            timestamps: false,
            underscored: true
        });

        return this;
    }
}

module.exports = Like;