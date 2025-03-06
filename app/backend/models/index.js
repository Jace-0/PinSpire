const { sequelize } = require('../util/db')
const User = require('./user')
const Pin = require('./pin')
const Board = require('./board')
const Follower = require('./follower')
const Comment = require('./comment')
const Like = require('./likes')
const Chat = require('./chat')
const Message = require('./message')
const BoardPin = require('./boardPin')

// Initialize models
const models = {
  User: User.init(sequelize),
  Pin: Pin.init(sequelize),
  Board: Board.init(sequelize),
  BoardPin: BoardPin.init(sequelize),
  Follower: Follower.init(sequelize),
  Comment: Comment.init(sequelize),
  Like: Like.init(sequelize),
  Chat: Chat.init(sequelize),
  Message: Message.init(sequelize)
}

/*  User and Pin associations */
models.Pin.belongsTo(models.User, {
  foreignKey: 'user_id',
  as: 'user'
})

models.User.hasMany(models.Pin, {
  foreignKey: 'user_id',
  as: 'pins'
})

models.Pin.hasMany(models.Like, {
  foreignKey: 'likeable_id',
  as: 'likes', // all likes on this pin
  scope: {
    likeable_type: 'pin'
  }
})

/*  Board associations*/
// User-Board: One-to-many
models.Board.belongsTo(models.User, {
  foreignKey: 'user_id',
  as: 'user'
})


models.User.hasMany(models.Board, {
  foreignKey: 'user_id',
  as: 'boards'
})

/* Board and Pin many-to-many relationship */
// Board-Pin: Many-to-many
models.Board.belongsToMany(models.Pin, {
  through: models.BoardPin,
  foreignKey: 'board_id',
  otherKey: 'pin_id',
  as: 'pins'
})

models.Pin.belongsToMany(models.Board, {
  through: models.BoardPin,
  foreignKey: 'pin_id',
  otherKey: 'board_id',
  as: 'boards'
})


/* Followers/Following (Self-referential) associations */
models.User.belongsToMany(models.User, {
  through: models.Follower,
  as: 'followers',
  foreignKey: 'following_id',
  otherKey: 'follower_id'
})

models.User.belongsToMany(models.User, {
  through: models.Follower,
  as: 'following',
  foreignKey: 'follower_id',
  otherKey: 'following_id'
})


/* Comment association */
models.Comment.belongsTo(models.Pin, {
  foreignKey: 'pin_id',
  as: 'pin'
})

models.Comment.belongsTo(models.User, {
  foreignKey: 'user_id',
  as: 'user'
})

models.Pin.hasMany(models.Comment, {
  foreignKey: 'pin_id',
  as: 'comments'
})

models.User.hasMany(models.Comment, {
  foreignKey: 'user_id',
  as: 'comments'
})

// Self-referential association for replies
models.Comment.belongsTo(models.Comment, {
  as: 'parent',
  foreignKey: 'parent_id'
})

models.Comment.belongsTo(models.Comment, {
  as: 'replies',
  foreignKey: 'parent_id'
})

models.Comment.hasMany(models.Like, {
  foreignKey: 'likeable_id',
  constraints: false,
  scope: {
    likeable_type: 'comment'
  },
  as: 'likes'
})


/* Likes associations */
models.Like.belongsTo(models.User, {
  foreignKey: 'user_id',
  as: 'user'
})

models.Like.belongsTo(models.Pin, {
  foreignKey: 'likeable_id',
  as: 'pin',
})

models.Like.belongsTo(models.Pin, {
  foreignKey: 'likeable_id',
  as: 'likeable',
  constraints: false,
})


models.User.hasMany(models.Like, {
  foreignKey: 'user_id',
  as: 'likes', // all likes made by the user
})



/* Chat and Message Association */
models.Chat.hasMany(models.Message, {
  foreignKey: 'chat_id'
})

models.Message.belongsTo(models.Chat, {
  foreignKey: 'chat_id'
})

models.Chat.belongsTo(models.User, {
  foreignKey: 'user1_id' ,
  as: 'user1'
})

models.Chat.belongsTo(models.User, {
  foreignKey: 'user2_id' ,
  as: 'user2'
})

models.Message.belongsTo(models.User, {
  foreignKey: 'sender_id',
  as: 'sender'
})

module.exports = {
  sequelize,
  ...models
}