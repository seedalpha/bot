/**
 * Module dependencies
 */

var debug       = require('debug');
var Queue       = require('./queue');
var Cmd         = require('./cmd');
var Events      = require('events').EventEmitter;
var inherits    = require('util').inherits;

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
  
  this.middleware = [];
}

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
 * @param {String|RegExp|Array<String,RegExp>} name, optional
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
        Queue(cmd).add(args).add(def).end(next);
      });
    } else { // string
      this.middleware.push(function(cmd, next) {    
        if (term !== cmd.intent) return next();
        Queue(cmd).add(args).add(def).done(next);
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
 * @param {Function} cb(err, result)
 * @return {Bot} self
 */

Bot.prototype.exec = function(str, ctx, cb) {
  if (typeof ctx === 'function') {
    cb = ctx;
    ctx = {};
  }
  
  cb = cb || function(){};
  
  var cmd = new Cmd({
    rawMessage: str,
    message: str,
    params: [],
    intent: null,
    intentParams: null,
    parts: null,
    context: ctx
  });
  
  cmd.on('respond', function() {
    cb(null, cmd.response);
  });
  
  Queue(cmd)
    .add(this.middleware)
    .done(function(err, cmd) {
      cb(err);
    });
  
  return this;
}

/**
 * Expose
 */

exports = module.exports = Bot;