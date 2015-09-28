var Bot = require('../');
var bot = new Bot();

bot.use(wit(apiKey)); // should add `.intent` to cmd

bot.cmd('get_stock_quote', function(cmd, next) {
  api.getQuote(cmd.intentParams.ticker, function(err, quote) {
    if (err) return cmd.error(err);
    cmd.result(quote.price);
  });
});

bot.on('result', function(cmd, result) {
  console.log(result); // '125.008'
});

bot.exec('what apple is trading like?');