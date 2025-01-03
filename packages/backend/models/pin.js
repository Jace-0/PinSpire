const { Model, DataTypes } = require('sequelize');

class Pin extends Model {
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
            title: {
                type: DataTypes.STRING(255),
                allowNull: false
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            image_url: {
                type: DataTypes.STRING(255),
                allowNull: false
            },
            external_url: {
                type: DataTypes.STRING(255),
                allowNull: true
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
            sequelize,        // database connection instance
            tableName: 'pins', // actual table name in database
            timestamps: true,  // enables created_at and updated_at
            underscored: true // uses snake_case for column names
        });
        return this;
    }
    // Defining relationship with assiciated mehtod

    // static associate(models) {
    //     this.belongsTo(models.User, {
    //         foreignKey: 'user_id',
    //         as: 'user'
    //     });
    // }
}

module.exports = Pin;