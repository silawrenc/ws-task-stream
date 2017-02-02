const sinon = require('sinon');
const tap = require('tap');
const client = require('../src/client');

tap.test('Test client contains batch, item, complete handlers' , t => {
  let c = client(sinon.stub(), sinon.stub());
  t.type(c.batch, 'function');
  t.type(c.item, 'function');
  t.type(c.complete, 'function');
  t.end();
});
