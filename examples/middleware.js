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
  cmd.result('Hello!');
});

bot.on('result', function(cmd, result) {
  console.log(result); // 'Hello!'
});

bot.exec(' HeLlo  ');