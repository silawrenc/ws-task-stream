const sinon = require('sinon');
const tap = require('tap');
const bind = require('../src/client-binding');
const msg = require('../src/message');

tap.test('Test client binding binds batch, item, complete handlers' , t => {
  let socket = {
    on: sinon.spy(),
    once: sinon.spy(),
  };
  bind(socket, sinon.stub(), sinon.stub());
  t.true(socket.once.calledOnce);
  t.true(socket.on.calledTwice);
  t.true(socket.once.calledWith(msg.batch));
  t.true(socket.on.calledWith(msg.item));
  t.true(socket.on.calledWith(msg.complete));
  t.end();
});
