var Bot = require('../');
var bot = new Bot();

bot.cmd(/hello/i, function(cmd) {
  cmd.send(cmd.channel, 'Hello!');
});

bot.on('send', function(channel, message) {
  console.log('Bot responded with', channel, message); // '1234', 'Hello!'
});

bot.exec('Hello', { channel: '1234' });