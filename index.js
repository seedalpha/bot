/**
 * Module dependencies
 */

var debug       = require('debug');
var queue       = require('./queue');
var Cmd         = require('./cmd');
var Events      = require('events').EventEmitter;
var inherits    = require('util').inherits;
var through     = require('through2').obj;

/**
 * Logger
 */

var log = debug('bot');

/**
 * Constructor
 */

function Bot() {
  if (!(this instanceof Bot)) {
    return new Bot();
  }
  
  Events.call(this);
  
  this.middleware = [];
  
  log('Initialized');
  
  this.on('result', function() {
    log('Result: %j', arguments);
  });
  
  this.on('error', function() {
    log('Error %j', arguments);
  });
  
  this.on('log', function() {
    log(arguments);
  });
}

inherits(Bot, Events);

/**
 * Append middleware
 *
 * @param {Function} middleware(cmd, next)
 * @return {Bot} self
 */

Bot.prototype.use = function(middleware) {
  this.middleware.push(middleware);
  log('Middleware %s', this.middleware.length);
  return this;
}

/**
 * Register bot command
 *
 * @param {String|RegExp|Array<String,RegExp>} pattern
 * @param {Function} middleware...(cmd, next), optional
 * @param {Function} def(cmd, next), command definition
 * @return {Bot} self
 */

Bot.prototype.cmd = function() {
  var args = [].slice.call(arguments);
  var def = args.pop();
  var match = args.shift();
  
  if (typeof match === 'function') {
    throw new Error('At least one pattern or intent should be defined');
  }
  
  if (!Array.isArray(match)) {
    match = [match];
  }
  
  // match regex or intents
  match.forEach(function(term) {
    if (term instanceof RegExp) {
      this.middleware.push(function(cmd, next) {
        if (!term.test(cmd.message)) return next();
        cmd.params = [].slice.call(term.exec(cmd.message)).slice(1);
        queue(cmd).add(args).add(def).end(next);
      });
    } else { // string
      this.middleware.push(function(cmd, next) {    
        if (term !== cmd.intent) return next();
        queue(cmd).add(args).add(def).done(next);
      });
    }
    log('Middleware %s', this.middleware.length);
  }.bind(this));
  
  return this;
}

/**
 * Parse a given raw string with a given context
 * and execute a command, if exists
 *
 * @param {String} str
 * @param {Object} context, optional
 * @return {Bot} self
 */

Bot.prototype.exec = function(str, ctx) {
  process.nextTick(function() {
    log('Exec %s %j', str, ctx);
    queue(Cmd({
      rawMessage: str,
      message: str,
      params: [],
      intent: null,
      intentParams: null,
      parts: null,
      context: ctx || {},
      emit: this.emit.bind(this)
    }))
    .add(this.middleware)
    .done(function(err, cmd) {
      log('Error: %j', err);
      if (err) this.emit('error', ctx.channel.id, err);
    }.bind(this));
  }.bind(this));
  
  return this;
}

/**
 * Create a through stream of objects
 * that takes chunks like { message: '', context: {} }
 * and emits chunks like { type: 'result', args: [...] }
 *
 * @return {Stream.Tranform} stream
 */

Bot.prototype.stream = function() {
  var handle = function(chunk, enc, cb) {
    this.exec(chunk.message, chunk.context);
    cb();
  }.bind(this);
  
  var stream = through({
    highWaterMark: 1024
  }, handle);
  
  this.on('result', function() {
    stream.push({
      type: 'result',
      args: [].slice.call(arguments)
    });
  });
  
  this.on('error', function() {
    stream.push({
      type: 'result',
      args: [].slice.call(arguments)
    });
  });
  
  this.on('log', function() {
    stream.push({
      type: 'log',
      args: [].slice.call(arguments)
    });
  });
  
  return stream;
}

/**
 * Expose
 */

exports = module.exports = Bot;