const { DataTypes, Sequelize } = require('sequelize');

module.exports = {
    up: async ({ context: queryInterface }) => {
        await queryInterface.createTable('comment_replies', {
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: Sequelize.literal('uuid_generate_v4()')
            },
            comment_id: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: 'comments',
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
                allowNull: false
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
            }
        });

        // Add indexes
        await queryInterface.addIndex('comment_replies', ['comment_id'], {
            name: 'idx_comment_replies_comment_id'
        });
    },

    down: async ({ context: queryInterface }) => {
        await queryInterface.dropTable('comment_replies');
    }
};