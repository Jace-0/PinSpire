const info = (...params) => {
  console.log(...params)
}

const warn = (...params) => {
  console.warn(...params)
}
const error = (...params) => {
  console.error(...params)
}

module.exports = {
  info, warn, error
}