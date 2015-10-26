/**
 * Module dependencies
 */

var debug       = require('debug');
var queue       = require('seed-queue');
var Events      = require('events').EventEmitter;
var inherits    = require('util').inherits;
var through     = require('through2').obj;

/**
 * Logger
 */

var log = debug('bot');

/**
 * Constructor
 *
 * @param {Object} options
 */

function Bot(options) {
  if (!(this instanceof Bot)) {
    return new Bot(options);
  }
  
  Events.call(this);
  
  this.middleware = [];
  this.options = options || {};
  this.send = this.send.bind(this);
  this.log = this.log.bind(this);
  
  var handle = function(chunk, enc, cb) {
    if (chunk.type === 'message') {
      this.exec(chunk.text || '', chunk);
    }
    this.emit(chunk.type, chunk, this);
    cb();
  }.bind(this);
  
  this._stream = through({
    highWaterMark: 1024
  }, handle);
  
  log('Initialized');
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
    this.emit('exec', str, ctx);
    queue({
      rawMessage: str,
      message: str,
      params: [],
      intent: null,
      intentParams: null,
      parts: null,
      context: ctx || {},
      options: this.options,
      send: this.send,
      log: this.log
    })
    .add(this.middleware)
    .end(function(err, cmd) {
      if (err) {
        this.emit('error', err, cmd);
        log('Error: %j', err);
      } else {
        log('Finished');
      }
    }.bind(this));
  }.bind(this));
  return this;
}

/**
 * Send message on behalf of bot
 * 
 * @param {String} channelId
 * @param {String} message
 * @return {Bot} self
 */

Bot.prototype.send = function(channel, message) {
  if (typeof channel === typeof message) { // if they are strings
    this._stream.push([channel, message]);
  } else {
    this._stream.push(channel); // if it's an object
  }
  
  this.emit('send', channel, message);
  
  return this;
}

/**
 * Get a through stream of messages
 *
 * @return {Stream.Tranform} stream
 */

Bot.prototype.stream = function() {
  return this._stream;
}

/**
 * Log stuff
 * 
 * @return {Bot} self
 */

Bot.prototype.log = function() {
  log.apply(log, [].slice.call(arguments));
  return this;
}

/**
 * Expose
 */

exports = module.exports = Bot;