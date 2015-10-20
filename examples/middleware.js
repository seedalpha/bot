var Bot = require('../');
var bot = new Bot();

function compact(cmd, next) {
  cmd.message = cmd.message.replace(/\s+/g,' ').trim();
  next();
}

function downcase(cmd, next) {
  cmd.message = cmd.message.toLowerCase();
  next();
}

bot.use(compact);
bot.use(downcase);

bot.cmd([/hello/, /hi/], function(cmd, next) {
  cmd.send(cmd.channel, 'Hello!');
});

bot.on('send', function(channel, message) {
  console.log(channel, message); // '1234', 'Hello!'
});

bot.exec(' HeLlo  ', { channel: '1234' });