# Bot

a generic, pluggable chat bot 

### Installation

    $ npm install seed-bot

### API

#### Bot

##### constructor([{Object} options]):Bot

```javacript
var bot = new Bot();
```

##### use({Function} middleware(cmd, next)):Bot

Registers new command middleware 

```javacript
function trim(cmd, next) {
  cmd.message = cmd.message.trim();
  next();
}

bot.use(trim);
```

##### cmd({String|RegExp|Array<String|RegExp>} pattern[, {Function} ...middleware(cmd, next)], {Function} definition(cmd, next)):Bot

Registers a new bot command. It will try to match incoming message against intents/patterns, execute middleware and definition. If cmd is a string, it will be matched against intent, if it's a regexp, it will be match agaisnt a message

```javacript
bot.use(wit(witApiKey));

// string
bot.cmd('hi', function(cmd) {
  cmd.send('Hello');
});

// strings
bot.cmd(['hi', 'hello', 'welcome'], function(cmd) {
  cmd.send(cmd.channel.id, fmt('%s to you!', cmd.message));
});

// regex
bot.cmd(/hi/i, function(cmd) {
  cmd.send(cmd.channel.id, 'Hello');
});

// regex array
bot.cmd([/hi .*/, /hello .*/], function(cmd) {
  cmd.send(cmd.channel.id, fmt('%s back!', cmd.message.split(' ').shift()));
});
```

##### exec({String} message[, {Object} context]):Bot

Executes a command.

```javascript
bot.on('send', function(channel, message) {
  // '8642', 'Invitation has been successfully sent'
  // send bot response
});

bot.cmd(/invite .*/i, function(cmd, next) {
  if (!cmd.context.isAdmin) {
    return cmd.log('Unauthorized');
  }
  
  api.invite(cmd.params[0], function(err) {
    if (err) return cmd.log(err);
    cmd.send(cmd.channel.id, 'Invitation has been successfully sent');
  });
});

bot.exec('invite user@example.com', { 
  user: '1234', 
  channel: '8642', 
  isAdmin: true
});
```
##### send({String|Object} channel[, {String} message]):Bot

Send a bot message

```javascript

bot.send('echo', 'user said: hello');

bot.send({
  type: 'message',
  channel: 'echo',
  text: 'user said: hello'
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

##### on({String} type, {Function} callback):Bot

Bot extends event emitter to bubble slack events up

```javascript
bot.on('team_join', function(message) {
  // https://api.slack.com/events/team_join
  message.type // 'team_join'
  message.user // { ... }
});
```

#### cmd

```javascript
bot.use(function(cmd, next) {
  cmd.message       // 'Hello'
  cmd.rawMessage    // 'Hello'
  cmd.params        // [], if cmd is matched against a pattern, params will be matched unknowns
  cmd.intent        // if wit is used, intent should be a matched intent from wit
  cmd.intentParams  // wit intent params
  cmd.confidence    // wit matching confidence
  cmd.parts         // null, a placeholder for matched parts
  cmd.context       // exec context, eg.: { user: '1234', channel: '8642' }
  cmd.send(channel, message) // send bot message
  cmd.log(...args)  // log to debug, will emit `log`
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
    cmd.send(cmd.channel, fmt('%s: %s', result.company, result.price));
  });
});

// match command based on regex
bot.cmd(/quote .*/, function(cmd, next) {
  getQuote(cmd.params[0], function(err, result) {
    if (err) return next(err);
    var message = fmt('%s: %s', result.company, result.price);
    cmd.log(message);
    cmd.send(cmd.channel, message);
  });
});

// match any regex or intent
bot.cmd([/hi.*/, /hello.*/, 'greeting'], function(cmd, next) {
  cmd.send(cmd.channel, 'Welcome!');
});

// have second level of middleware for after command had been matched
bot.cmd(/invite .*/, isAdmin, function(cmd, next) {
  invite(cmd.params[0]);
  cmd.send(cmd.channel, fmt('User %s invited', cmd.params[0]));
});

var context = {
  user: 'john doe',
  channel: '123abc',
  isAdmin: false
};

bot.on('send', function(channel, message) {
  console.log(channel, message); // '123abc', 'Apple 125.004'; '123abc', 'Welcome'
});

bot.exec('quote AAPL', context);
bot.exec('hi there!', context);

```

### Examples

Check more [examples](examples)

### Author

Vladimir Popov <vlad@seedalpha.net>

### License

SeedAlpha ©2015
