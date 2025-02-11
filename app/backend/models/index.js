const { sequelize } = require('../util/db')
const User = require('./user')
const Pin = require('./pin')
const Board = require('./board')
const Follower = require('./follower')
const Comment = require('./comment')
const Like = require('./likes')
const CommentReply = require('./comment_reply')
const Chat = require('./chat')
const Message = require('./message')

// Initialize models
const models = {
  User: User.init(sequelize),
  Pin: Pin.init(sequelize),
  Board: Board.init(sequelize),
  Follower: Follower.init(sequelize),
  Comment: Comment.init(sequelize),
  Like: Like.init(sequelize),
  CommentReply: CommentReply.init(sequelize),
  Chat: Chat.init(sequelize),
  Message: Message.init(sequelize)
}

// User and Pin associations
models.Pin.belongsTo(models.User, {
  foreignKey: 'user_id',
  as: 'user'
})

models.User.hasMany(models.Pin, {
  foreignKey: 'user_id',
  as: 'pins'
})

// Board associations
models.Board.belongsTo(models.User, {
  foreignKey: 'user_id',
  as: 'user'
})

models.Pin.belongsTo(models.Board, {
  foreignKey: 'board_id',
  as: 'board'
})

models.User.hasMany(models.Board, {
  foreignKey: 'user_id',
  as: 'boards'
})

// Board and Pin many-to-many relationship
models.Board.belongsToMany(models.Pin, {
  through: 'board_pins',
  foreignKey: 'board_id',
  otherKey: 'pin_id',
  as: 'pins'
})

models.Pin.belongsToMany(models.Board, {
  through: 'board_pins',
  foreignKey: 'pin_id',
  otherKey: 'board_id',
  as: 'boards'
})


// Followers/Following (Self-referential) associations
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


// Comment associations
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


// Likes associations
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
//   scope: {
//     likeable_type: 'pin'
// }
})

models.Like.belongsTo(models.Comment, {
  foreignKey: 'likeable_id',
  as: 'comment', // comment that was liked
})

models.Like.belongsTo(models.CommentReply, {
  foreignKey: 'likeable_id',
  as: 'reply',
})

models.Pin.hasMany(models.Like, {
  foreignKey: 'likeable_id',
  as: 'likes', // all likes on this pin
  scope: {
    likeable_type: 'pin'
  }
})

models.User.hasMany(models.Like, {
  foreignKey: 'user_id',
  as: 'likes', // all likes made by the user
})

models.Comment.hasMany(models.Like, {
  foreignKey: 'likeable_id',
  constraints: false,
  scope: {
    likeable_type: 'comment'
  },
  as: 'likes'
})

// Comment Replies
models.CommentReply.hasMany(models.Like, {
  foreignKey: 'likeable_id',
  as: 'likes' // all likes on this reply
})

models.CommentReply.belongsTo(models.Comment, {
  foreignKey: 'comment_id',
  as: 'comment'
})

models.CommentReply.belongsTo(models.User, {
  foreignKey: 'user_id',
  as: 'user'
})

models.Comment.hasMany(models.CommentReply, {
  foreignKey: 'comment_id',
  as: 'replies'
})



//Chat and Message Association

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