const msg = require('./message');
const client = require('./client');

module.exports = (socket, handler, callback) => {
  const done = () => {
    socket.close();
    callback();
  }
  const c = client(handler, done);
  socket.once(msg.batch, c.batch);
  socket.on(msg.item, c.item);
  socket.on(msg.complete, c.complete);
}
