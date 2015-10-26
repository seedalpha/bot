var Bot = require('./');

var bot = new Bot();

function normalize(cmd, next) {
  cmd.message = cmd.message.toLowerCase().trim();
  next();
}

bot.use(normalize);

bot.cmd([/hi.*/, /hello.*/, 'greeting'], function(cmd, next) {
  cmd.send('123', 'Welcome!');
});

bot.exec('Hi');
bot.exec('hello');

