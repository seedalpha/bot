/**
 * Module dependencies
 */

var Events      = require('events').EventEmitter;
var inherits    = require('util').inherits;

/**
 * Bot command
 *
 * @param {Object} params
 */

function Cmd(params) {
  if (!(this instanceof Cmd)) {
    return new Cmd(params);
  }
  
  Events.call(this);
  
  // extend self with params
  Object.keys(params).forEach(function(key) {
    this[key] = params[key];
  }.bind(this));
  
  // cleanup
  this.on('respond', function() {
    process.nextTick(function() {
      this.removeAllListeners();
    }.bind(this));
  }.bind(this));
}

inherits(Cmd, Events);

/**
 * Respond from command
 * 
 * @emit 'respond'
 */

Cmd.prototype.respond = function() {
  var args = [].slice.call(arguments);
  this.response = args;
  this.emit.apply(this, ['respond'].concat(args));
}

/**
 * Log from command
 *
 * @emit 'log'
 */

Cmd.prototype.log = function() {
  var args = [].slice.call(arguments);
  this.emit.apply(this, ['log'].concat(args));
}

/**
 * Expose
 */

exports = module.exports = Cmd;
