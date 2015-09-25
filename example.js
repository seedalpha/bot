var Bot = require('./');

var bot = new Bot();

bot.use(function(cmd, next) {
  cmd.message = cmd.message.toLowerCase().trim();
  next();
});

bot.cmd([/hi.*/, /hello.*/, 'greeting'], function(cmd, next) {
  cmd.log('Welcome!');
  cmd.result('Welcome!');
});

bot.exec('Hi');
bot.exec('hello');

bot.on('result', function(response) {
  console.log('Bot responded with:', response);
});

bot.on('log', function(response) {
  console.log('Bot logged', response);
});

