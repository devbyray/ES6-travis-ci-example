module.exports = function (path) {
  try {
    require.resolve(path)
    return true
  } catch (e) {
    return false
  }
}
