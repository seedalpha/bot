# Bot

a generic, pluggable chat bot 

### Installation

    $ npm install seed-bot

### API

#### Bot

##### constructor():Bot

```javacript
var bot = new Bot();
```

##### use({Function} middleware(cmd, next)):Bot

Registers new command middleware 

```javacript
function trim(cmd, next) {
  cmd.message = cmd.meesage.trim();
  next();
}

bot.use(trim);
```

##### cmd({String|RegExp|Array<String|RegExp>} pattern[, {Function} ...middleware(cmd, next)], {Function} definition(cmd, next)):Bot

Registers a new bot command. it will try to match incoming message against intents/patterns, execute middleware and definition. If cmd is a string, it will be matched against intent, if it's a regexp, it will be match agaisnt a pattern

```javacript

bot.use(wit(witApiKey));

// string
bot.cmd('hi', function(cmd) {
  cmd.result('Hello');
});

// strings
bot.cmd(['hi', 'hello', 'welcome'], function(cmd) {
  cmd.result(cmd.format('%s to you!', cmd.message));
});

// regex
bot.cmd(/hi/i, function(cmd) {
  cmd.result('Hello');
});

// regex array
bot.cmd([/hi .*/, /hello .*/], function(cmd) {
  cmd.result(cmd.format('%s back!', cmd.message.split(' ').shift()));
});
```

##### exec({String} message[, {Object} context]):Bot

Executes a command.

Note: bot is an event emitter, so, in order to get back the response, one has to add an event listener

```javascript

bot.on('result', function(cmd, channel, message) {
  // do stuff with message
});

bot.on('error', function(cmd, channel, message) {
  // do stuff with message
});

bot.cmd(/invite .*/i, function(cmd, next) {
  if (!cmd.context.isAdmin) {
    return bot.error('Unauthorized');
  }
  
  api.invite(cmd.params[0], function(err) {
    if (err) return bot.error(err);
    bot.result(cmd.channel, 'Invitation has been successfully sent');
  });
});

bot.exec('invite user@example.com', { 
  user: '1234', 
  channel: '8642', 
  isAdmin: false
});
```

##### stream():Stream

Create a transform stream of commands/responses

```javascript
var slackStream = slack.stream();

slackStream
  .pipe(bot.stream())
  .pipe(slackStream);
```

#### Cmd

Bot commands are internally instantiated as `Cmd`s

```javascript
bot.use(function(cmd, next) {
  cmd.message // 'Hello'
  cmd.rawMessage // 'Hello'
  cmd.params // [], if cmd is matched against a pattern, params will be matched unknowns
  cmd.intent // if wit is used, intent should be a matched intent from wit
  cmd.intentParams // wit intent params
  cmd.confidence // wit matching confidence
  cmd.parts // null, a placeholder for matched parts
  cmd.context // exec context, eg.: { user: '1234', channel: '8642' }
  cmd.emit // bot's emit
  cmd.format(expression, ...args) // helper to format bot messages. eg.: ('Hello %s', cmd.context.user)
  cmd.result(...args) // respond with success, will emit `result`
  cmd.error(...args) // respond with error, will emit `error`
  cmd.log(...args) // log to debug, will emit `log`
});

bot.exec('Hello', { user: '1234', channel: '8642' });
```

### Usage

```javascript
var Bot = require('seed-bot');
var bot = new Bot();

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

//...

bot.use(wit(token));
bot.use(compact);
bot.use(downcase);
bot.use(stripLeading('<@U12312312321>:'));
bot.use(stripLeading('<@U12312312321>'));

// match command based on intent
bot.cmd('get_stock_quote', function(cmd, next) {
  getQuote(cmd.intentParams.ticker, function(err, result) {
    if (err) return next(err);
    cmd.result(cmd.format('%s: %s', result.company, result.price));
  });
});

// match command based on regex
bot.cmd(/quote .*/, function(cmd, next) {
  getQuote(cmd.params[0], function(err, result) {
    if (err) return next(err);
    cmd.log(cmd.format('%s: %s', result.company, result.price));
    cmd.result(cmd.format('%s: %s', result.company, result.price));
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

bot.on('result', function(cmd, result) {
  console.log(result); // 'Apple 125.004', 'Welcome'
});

bot.exec('quote AAPL', context);
bot.exec('hi there!);

```

### Examples

Check more [examples](examples)

### Author

Vladimir Popov <vlad@seedalpha.net>

### License

SeedAlpha ©2015
