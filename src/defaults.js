module.exports = {
  query: JSON.stringify({
    v: 3,
    q: {
      collection: 'data',
      find: {}
    }
  }, null, 2),
  socket: JSON.stringify({
    v: 3,
    q: {
      find: {}
    }
  }, null, 2)
}
