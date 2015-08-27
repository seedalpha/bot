var Bot = require('./');

function trim(cmd, next) {
  cmd.message = cmd.message.trim();
  next();
}

function downcase(cmd, next) {
  cmd.message = cmd.message.toLowerCase();
  next();
}

var bot = new Bot();

bot
  .use(trim)
  .use(downcase)
  .cmd(['greeting', /hello/], function(cmd, next) {
    cmd.respond('Welcome!');
    // next('fuck');
  });

bot.exec('  HELLO', function(error, result) {
  console.log(error, result);
});