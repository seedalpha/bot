var Bot = require('../');
var bot = new Bot();

bot.use(wit(apiKey)); // should add `.intent` to cmd; !get wit package

bot.cmd('get_stock_quote', function(cmd, next) {
  api.getQuote(cmd.intentParams.ticker, function(err, quote) {
    if (err) return cmd.log(err);
    cmd.send(cmd.channel, quote.price);
  });
});

bot.on('send', function(channel, message) {
  console.log(channel, message); // '1234', '125.008'
});

bot.exec('what apple is trading like?', { channel: '1234' });