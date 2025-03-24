const { DataTypes, Sequelize } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.createTable('followers', {
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
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false
      }
    })

    // // Add composite primary key
    // await queryInterface.addConstraint('followers', {
    //   fields: ['follower_id', 'following_id'],
    //   type: 'primary key',
    //   name: 'followers_pkey'
    // })
  },

  down: async ({ context: queryInterface }) => {
    await queryInterface.dropTable('followers')
  }
}