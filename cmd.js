/**
 * Module dependencies
 */

var extend = require('seed-extend');

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
    ['result'].concat([].slice.call(arguments))
  );
}

/**
 * Error from command
 * 
 * @emit 'error'
 */

Cmd.prototype.error = function() {
  this.emit.apply(null, 
    ['error'].concat([].slice.call(arguments))
  );
}

/**
 * Log from command
 *
 * @emit 'log'
 */

Cmd.prototype.log = function() {
  this.emit.apply(null, 
    ['log'].concat([].slice.call(arguments))
  );
}

/**
 * Expose
 */

exports = module.exports = Cmd;