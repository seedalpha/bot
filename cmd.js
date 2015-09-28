/**
 * Module dependencies
 */

var extend = require('seed-extend');
var fmt    = require('node-fmt');

/**
 * Bot command
 *
 * @param {Object} params
 */

function Cmd(params) {
  if (!(this instanceof Cmd)) {
    return new Cmd(params);
  }
  
  extend(this, params);
}

/**
 * Respond from command
 * 
 * @emit 'respond'
 */

Cmd.prototype.result = function() {
  this.emit.apply(null, 
    ['result', this].concat([].slice.call(arguments))
  );
}

/**
 * Format string helper
 */

Cmd.prototype.format = function() {
  return fmt.apply(null, [].slice.call(arguments));
}

/**
 * Error from command
 * 
 * @emit 'error'
 */

Cmd.prototype.error = function() {
  this.emit.apply(null, 
    ['error', this].concat([].slice.call(arguments))
  );
}

/**
 * Log from command
 *
 * @emit 'log'
 */

Cmd.prototype.log = function() {
  this.emit.apply(null, 
    ['log', this].concat([].slice.call(arguments))
  );
}

/**
 * Expose
 */

exports = module.exports = Cmd;