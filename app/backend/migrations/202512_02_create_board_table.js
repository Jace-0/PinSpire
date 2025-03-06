const { DataTypes, Sequelize } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.createTable('boards', {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
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
      cover_image_url: {
        type: DataTypes.STRING(2048),
        allowNull: true,
        defaultValue: 'https://res.cloudinary.com/dafezeyjh/image/upload/v1741088708/Solid_Silver_Gray_a2uhza.jpg'
      },
      is_private: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
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
    })

    // Add unique constraint for user_id and name combination
    await queryInterface.addConstraint('boards', {
      fields: ['user_id', 'name'],
      type: 'unique',
      name: 'unique_user_board_name'
    })
  },

  down: async ({ context: queryInterface }) => {
    await queryInterface.dropTable('boards')
  }
}