# ws-task-stream

[![Master branch build status][ico-build]][travis]
[![Published version][ico-package]][package]
[![ISC Licensed][ico-license]][license]

**ws-task-stream** provides a node stream interface for queueing and sending tasks or data objects via socket.io. Initially envisaged for populating large databases in the browser, it might even work for that...

```js
const io = require('socket.io')(app);
const stream = require('ws-task-stream').stream;
const batch = 100;
const retries = 3;

io.on('connection', socket => {
  let resource = socket.request._query.resource;
  fs.createReadStream(resource)
    .pipe(stream(socket, batch, retries));
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

Acknowledgement is handled by calling the acknowledge argument to the client handler function, which has a standard node signature: pass no arguments to indicate success, an error for failure. It's possible to eager acknowledge (for example to maintain a client-side queue to be processed).

### Using promises with the client
The client provides a standard node callback API, but is also promise aware: if your handler function returns a thenable (anything with a `then` method), you don't need to manually acknowledge batches - the resolved/rejected promise state will be used. Further, if you don't provide a `done` callback to the client constructor, a promise will be returned which resolves when all tasks have been handled. e.g.

```js
const io = require('socket.io-client');
const client = require('ws-task-stream').client;
// db.save returns a promise here
client(io(url), db.save)
  .then(db.close)
  .then(() => alert('all done!'));

### Example
To run the example:
```
cd example
npm install stream-array
node server.js
```
`example/src/client.js` contains the pre-browserified source for the client.
```
### Install
```
npm install ws-task-stream
```
[travis]: https://travis-ci.org/silawrenc/ws-task-stream
[package]: https://www.npmjs.com/package/ws-task-stream
[ico-build]: http://img.shields.io/travis/silawrenc/ws-task-stream/master.svg
[ico-license]: https://img.shields.io/github/license/silawrenc/ws-task-stream.svg
[ico-package]: https://img.shields.io/npm/v/ws-task-stream.svg
[license]: LICENSE
