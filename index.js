const http = require('http');
const spawn = require('child_process').spawn;
const createHandler = require('github-webhook-handler');


const handler = createHandler({ path: '/auto_build', secret: 'genius' });

http.createServer(function (req, res) {
  handler(req, res, function (err) {
    res.statusCode = 404;
    res.end('no such location');
  })
}).listen(6666);

handler.on('error', function (err) {
  console.error('Error:', err.message)
});

// 监听到push事件的时候执行我们的自动化脚本
handler.on('push', function (event) {
  console.log('Received a push event for %s to %s',
    event.payload.repository.name,
    event.payload.ref);

  runCommand('sh', ['./index.sh'], function( txt ){
    console.log(txt);
  });
});

function runCommand( cmd, args, callback ){
  var child = spawn( cmd, args );
  var response = '';
  child.stdout.on('data', function( buffer ){ response += buffer.toString(); });
  child.stdout.on('end', function(){ callback( response ) });
}

 handler.on('issues', function (event) {
   console.log('Received an issue event for %s action=%s: #%d %s',
     event.payload.repository.name,
     event.payload.action,
     event.payload.issue.number,
     event.payload.issue.title)
});
