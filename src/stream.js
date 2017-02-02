const Writable = require('stream').Writable;
const msg = require('./message');

module.exports = (socket, batchSize = 1, maxRetries = 3, opts = {}) => {
  let written = 0;
  const batch = {
    size: batchSize,
    contents: [],
  }
  const retries = {
    max: maxRetries,
    used: 0
  }

  function write(data, enc, fn) {
    if (!written) { // first send batch size
      socket.emit(msg.batch, batch.size);
    }
    batch.contents.push(data);
    let shouldAcknowledge = ++written % batch.size === 0;
    message(data, shouldAcknowledge, fn);
  }

  function message(data, shouldAcknowledge, fn) {
    let args = [msg.item, data];
    shouldAcknowledge && args.push(acknowledge(fn));
    socket.emit(...args);
    !shouldAcknowledge && fn();
  }

  function acknowledge(fn) {
    return response => (response === msg.acknowledge) ? acknowledged(fn) : retry(fn);
  }

  function acknowledged(fn) {
    batch.contents = [];
    retries.used = 0;
    fn && fn();
  }

  function retry(fn) {
    if (++retries.used > retries.max) {
      let e = new Error('Max retries used');
      e.batch = batch.contents;
      batch.contents = [];
      retries.used = 0;
      fn ? fn(e) : stream.emit('error', e);
    }
    batch.contents.forEach((v, i, a) => message(v, i === a.length-1, fn));
  }


  opts.objectMode = true,
  opts.highWaterMark = opts.highWaterMark || batch.size;
  opts.write = write;
  let stream = new Writable(opts);
  stream.once('finish', () => socket.emit(msg.complete, written, acknowledge()));
  // error.bind
  return stream;
}
