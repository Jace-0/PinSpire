const { Model, DataTypes } = require('sequelize');

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
            ]
        });
        return this; // Returns the Pin class itself
    }


    // static associate(models) {
    //     this.belongsTo(models.User, {
    //         foreignKey: 'user_id',
    //         as: 'user'
    //     });
    //     this.hasMany(models.Pin, {
    //         foreignKey: 'board_id',
    //         as: 'pins'
    //     });
    // }
}

module.exports = Board