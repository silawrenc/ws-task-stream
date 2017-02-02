const io = require('socket.io-client');
const bind = require('../../src/client-binding');

const socket = io('http://localhost:8080/default', {transports: ['websocket'], upgrade: false, forceNew: true});
bind(socket, handler, done);

function handler(batch, handled) {
  message(`${batch.length} items arrived`);
  handled();
}

function done() {
  message('\nCompleted')
}

function message(contents) {
  document.body.appendChild(document.createTextNode(contents + '\n'));
}
