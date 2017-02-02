# ws-task-stream

A node stream interface for queueing and sending tasks or data objects via socket.io.

```js
const io = require('socket.io')(app);
const stream = require('ws-task-stream').stream;
const batch = 100;
const retries = 3;

io.on('connection', socket => {
  myDataStream.pipe(stream(socket, batch, retries));
});
```

The library also ships with a simple client for consuming resources.

```js
const io = require('socket.io-client');
const client = require('ws-task-stream').client;
const done = () => db.close();
function handler(batch, acknowledge) {
  db.save(batch)
    .catch(e => acknowledge(e))
    .then(() => acknowledge());
}
client(io(url), handler, done);
```

The stream provided by `stream` is a regular writable stream in object mode. Writes to it are cached and forwarded to the client, which must successfully acknowledge receipt of each batch before the next one can be sent. Batch size and no. of retries are both configurable and default to 1 (every write acknowledged) and 3 respectively.

Acknowledgement is handled by calling the acknowledge argument to the client handler function, which has a standard node signature: pass no arguments to indicate success, an error for failure. 

### Example
To run the example:
```
cd example
npm install stream-array
node server.js
```
`example/src/client.js` contains the pre-browserified source for the client.

### Install
```
npm install ws-task-stream
```
