# Bot

a generic, pluggable chat bot 

### Changelog

`3.0.0`:

- clean up `cmd`
- add `.result(...)` to cmd
- add `.error(...)` to cmd
- change bot result event to `result` (was 'respond')

`2.0.0`:

- `exec` doesn't take callback anymore, bot emits events instead

### Installation

    $ npm install seed-bot

### Usage

```javascript

var Bot = require('seed-bot');
var bot = new Bot();

// prepend a middleware
bot.use(function(cmd, next) {
  // normalize a command
  // cmd.message
  // cmd.params // []
  // cmd.rawMessage
  // cmd.intent
  // cmd.intentParams
  // cmd.confidence
  // cmd.parts // []
  // cmd.result(fn(result))
  // cmd.error(fn(error))
  // cmd.log(fn(args...))
  // cmd.emit(event, args...)
  next();
});

// wait for all middleware to finish
bot.use(function(cmd, next) {
  cmd.on('respond', function(args) {
    // do something else with result
    if (cmd.context.isAdmin) {
      // echo .... 
    }
  });
  next();
});

function compact(cmd, next) {
  cmd.message = cmd.message.replace(/\s+/g,' ').trim();
  next();
}

function downcase(cmd, next) {
  cmd.message = cmd.message.toLowerCase();
  next();
}

function stripLeading(str) {
  return function(cmd, next) {
    var index = cmd.message.indexOf(str);
    if (index === 0) {
      cmd.message = cmd.message.substring(str.length);
    }
    next();
  }
}

function isAdmin(cmd, next) {
  if (cmd.context.isAdmin) {
    return next();
  }
  next('Unauthorized');
}

...

bot.use(wit(token));
bot.use(compact);
bot.use(downcase);
bot.use(stripLeading('<@U12312312321>:'));
bot.use(stripLeading('<@U12312312321>'));

// match command based on intent
bot.cmd('get_stock_quote', function(cmd, next) {
  getQuote(cmd.intentParams.ticker, function(err, result) {
    if (err) return next(err);
    cmd.result(fmt('%s: %s', result.comapany, result.price));
  });
});

// match command based on regex
bot.cmd(/quote .*/, function(cmd, next) {
  getQuote(cmd.params[0], function(err, result) {
    if (err) return next(err);
    result = fmt('%s: %s', result.company, result.price);
    cmd.log(result);
    cmd.result(result);
  });
});

// match any regex or intent
bot.cmd([/hi.*/, /hello.*/, 'greeting'], function(cmd, next) {
  cmd.result('Welcome!');
});

// have second level of middleware for after command had been matched
bot.cmd(/invite .*/, isAdmin, function(cmd, next) {
  invite(cmd.params[0]);
  cmd.result(fmt('User %s invited', cmd.params[0]));
});

var context = {
  user: 'john doe',
  channel: '123abc',
  isAdmin: false
};


bot.on('result', function(result) {
  console.log(result); // 'Apple 125.004', 'Welcome'
});

bot.exec('quote AAPL', context);
bot.exec('hi there!);

```
 
### License

SeedAlpha ©2015
