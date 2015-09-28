var Bot = require('../');
var bot = new Bot();

bot.cmd(/hello/i, function(cmd) {
  cmd.result('Hello!');
});

bot.on('result', function(cmd, result) {
  console.log('Bot responded with', result); // 'Hello!'
});

bot.exec('Hello');