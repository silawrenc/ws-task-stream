const sinon = require('sinon');
const tap = require('tap');
const stream = require('../src/stream');
const msg = require('../src/message');

tap.test('Test stream constructs' , t => {
  let s = stream('socket', 100, 3);
  t.type(s, 'Writable');
  t.end();
});

tap.test('Test stream sends batch size before first write',  t => {
  let batchSize = 100;
  let socket = {emit: sinon.spy()};
  let s = stream(socket, batchSize);
  let message = {foo: 'bar'};
  s.write(message);
  t.true(socket.emit.calledTwice);
  t.same(socket.emit.getCall(0).args, [msg.batch, batchSize]);
  t.same(socket.emit.getCall(1).args, [msg.item, message]);
  t.end();
});

tap.test('Test stream waits for acknowledgement',  t => {
  let batchSize = 1;
  let socket = {emit: sinon.spy()};
  let s = stream(socket, batchSize);
  let message = {foo: 'bar'};
  s.write(message);
  s.write(message);
  // only one should now be written, plus batch size
  t.true(socket.emit.calledTwice);

  // last arg is callback to be invoked with response
  let callback = socket.emit.getCall(1).args[2];

  //invoke callback to acknowledge previous message
  callback(msg.acknowledge);
  t.true(socket.emit.calledThrice);
  t.end();
});

tap.test('Test stream retries on error',  t => {
  let batchSize = 1;
  let socket = {emit: sinon.spy()};
  let s = stream(socket, batchSize);
  let message = {foo: 'bar'};
  s.write(message);
  t.true(socket.emit.calledTwice);

  //invoke callback to reject previous message
  respond(socket, msg.error);

  t.true(socket.emit.calledThrice);
  t.same(socket.emit.getCall(2).args[1], message);
  t.end();
});

tap.test('Test stream retries up to max retries',  t => {
  let batchSize = 1;
  let maxRetries = 2;
  let socket = {emit: sinon.spy()};
  let s = stream(socket, batchSize, maxRetries);
  let message = {foo: 'bar'};
  s.write(message);
  t.true(socket.emit.calledTwice);

  //invoke callback to reject previous message
  respond(socket, msg.error);

  //first retry
  t.true(socket.emit.calledThrice);
  respond(socket, msg.error);

  //check for second retry
  t.equal(socket.emit.callCount, 4);

  t.end();
});

tap.test('Test stream emits error on exceeding max retries',  t => {
  let batchSize = 1;
  let maxRetries = 1;
  let socket = {emit: sinon.spy()};
  let s = stream(socket, batchSize, maxRetries);

  s.on('error', e => {
    t.equals(e.batch.length, 1)
    t.same(e.batch.pop(), {});
    // check no more writes
    t.true(socket.emit.calledThrice);
    t.end();
  });

  s.write({});
  t.true(socket.emit.calledTwice);

  //invoke callback to reject previous message
  respond(socket, msg.error);

  //first retry
  t.true(socket.emit.calledThrice);
  respond(socket, msg.error);
});


tap.test('Test stream sends complete when ended',  t => {
  let socket = {emit: sinon.spy()};
  let s = stream(socket, 100);

  s.write({});
  s.end();
  process.nextTick(() => {
    t.true(socket.emit.calledThrice);
    t.equal(socket.emit.lastCall.args[0], msg.complete);
    t.equal(socket.emit.lastCall.args[1], 1); // total messages sent
    t.end();
  })
});

tap.test('Test stream emits error when ended but not acknowledged',  t => {
  let socket = {emit: sinon.spy()};
  let s = stream(socket, 100, 0);

  s.on('error', e => {
    t.equals(e.batch.length, 1);
    t.end();
  });

  s.write({});
  s.end();

  process.nextTick(() => {
    t.true(socket.emit.calledThrice);
    respond(socket, msg.error);
  });
});



// respond to the last sent message by invoking the callback
function respond(socket, message) {
  return socket.emit.lastCall.args.pop()(message);
}
