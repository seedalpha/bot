var Bot = require('../');
var bot = new Bot();

function isAdmin(cmd, next) {
  if (!cmd.context.isAdmin) {
    next('Unauthorized');
  } else {
    next();
  }
}

bot.cmd(/invite .*/, isAdmin, function(cmd, next) {
  api.invite(cmd.params[0]);
  cmd.send(cmd.channel, fmt('User %s is invited', cmd.params[0]));
});

bot.on('send', function(channel, message) {
  console.log(message); // 'User admin@example.com is invited!'
});

bot.exec('invite admin@example.com', { 
  user: '1234', 
  channel: '8642', 
  isAdmin: true
});