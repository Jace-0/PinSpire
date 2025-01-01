const { DataTypes, Sequelize } = require('sequelize');

module.exports = {
    up: async ({ context: queryInterface }) => {
        // Enable UUID extension first
        await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

        await queryInterface.createTable('users', {
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: Sequelize.literal('uuid_generate_v4()'),
            },
            username: {
                type: DataTypes.STRING(50),
                unique: true,
                allowNull: false
            },
            email: {
                type: DataTypes.STRING(255),
                unique: true,
                allowNull: false
            },
            password_hash: {
                type: DataTypes.STRING(255),
                allowNull: false
            },
            first_name: {
                type: DataTypes.STRING(100),
                allowNull: true
            },
            last_name: {
                type: DataTypes.STRING(100),
                allowNull: true
            },
            dob: {
                type: DataTypes.DATEONLY,
                allowNull: false,
                validate: {
                    isDate: true
                }
            },
            gender: {
                type: DataTypes.ENUM('male', 'female', 'other', 'prefer not to say'),
                allowNull: true,
                defaultValue: null,
                comment: 'User gender preference'
            }, 
            country: {
                type: DataTypes.STRING(2),
                allowNull: true,
                validate: {
                    isUppercase: true,
                    len: [2, 2]
                },
                comment: 'ISO 3166-1 alpha-2 country code'
            },
            language: {
                type: DataTypes.STRING(2),
                allowNull: true,
                defaultValue: 'en',
                validate: {
                    isLowercase: true,
                    len: [2, 2]
                },
                comment: 'ISO 639-1 language code'
            },
            bio: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            avatar_url: {
                type: DataTypes.STRING(255),
                allowNull: true
            },
            website_url: {
                type: DataTypes.STRING(255),
                allowNull: true
            },
            location: {
                type: DataTypes.STRING(100),
                allowNull: true
            },
            created_at: {
                type: DataTypes.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                allowNull: false
            },
            updated_at: {
                type: DataTypes.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                allowNull: false
            },
            last_login: {
                type: DataTypes.DATE,
                allowNull: true
            },
            is_verified: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            },
            is_active: {
                type: DataTypes.BOOLEAN,
                defaultValue: true
            }
        });
    },

    down: async ({ context: queryInterface }) => {
        await queryInterface.dropTable('users');
    }
};