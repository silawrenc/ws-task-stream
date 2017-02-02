let app = require('http').createServer(handler)
let io = require('socket.io')(app);
let fs = require('fs');
const stream = require('../src/stream');
const streamify = require('stream-array');

io.of('/default').on('connection', socket => {
  let data = Array(1234).map((v, i) => ({foo: 'bar', value: i}));
  streamify(data).pipe(stream(socket, 100, 1));
})

app.listen(8080, () => console.log('server listening on 8080'));

function handler (req, res) {
  name = req.url === '/' ? '/index.html' : req.url;
  fs.readFile(__dirname + name, (err, data) => {
    res.writeHead(err ? 500 : 200);
    res.end(err ? 'Error loading index.html' : data);
  });
}
