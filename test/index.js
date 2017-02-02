const client = require('./src/client');
const clientBinding = require('./src/client-binding');
const stream = require('./src/stream');
const streamBinding = require('./src/stream-binding');


module.exports = {
  stream,
  client,
  binding: {
    client: clientBinding,
    stream: streamBinding
  }
}
