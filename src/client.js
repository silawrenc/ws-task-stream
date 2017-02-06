const msg = require('./message');

module.exports = (handler, done) => {
  const buffer = [];
  let batch;
  const clear = () => buffer.length = 0;
  const batchHandler = size => batch = size;

  function resolve(handler, cb) {
    let result = handler(buffer, cb);
    if (typeof result.then ===  'function') {
      result.then(acknowledge).catch(acknowledge);
    }
  }

  function complete(total, reply) {
    if (buffer.length !== (total % batch)) {
      clear();
      return reply(msg.error);
    }
    handler(buffer, acknowledge(reply, done));
  }

  function item(data, reply) {
    buffer.push(data);
    if (buffer.length === batch) {
      handler(buffer, acknowledge(reply));
    }
  }

  function acknowledge(reply, done) {
    return err => {
      clear();
      if (err instanceof Error) {
        return reply(msg.error);
      }
      reply(msg.acknowledge);
      done && done();
    }
  }

  return {batch: batchHandler, complete, item};
}
