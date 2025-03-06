const CACHE_KEYS = {
  pin: (id) => `pin:${id}`,
  user: (username) => `user:${username}`,
  userPins: (userId) => `user:${userId}:pins`,
  allPins : (cursor, limit) =>  `pins:${cursor || 'latest'}:${limit}`,
  userLikedPins: (userId) => `user:${userId}:liked:pins`,
  userBoards : (userId) => `user:${userId}:boards`,
  board: (boardId) => `board:${boardId}`
}

const CACHE_TTL = {
  PIN: 3600,          // 1 hour
  USER: 3600,          // 1 hour
  USER_PINS: 3600,    // 1 hour
  RECENT_PINS: 1800,   // 30 minutes
  LIKED_PINS: 1600,
  ALL_PINS: 3600, // 1 hour
  BOARDS: 3600,
  BOARD: 3600
}

module.exports = {
  CACHE_KEYS,
  CACHE_TTL
}