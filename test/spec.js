var should = require('chai').should();
var Bot = require('../');

describe('Bot', function() {
  
  describe('#constructor', function() {
    it('should create an instance', function() {
      Bot().should.be.instanceof(Bot);
      (new Bot).should.be.instanceof(Bot);
    });
  });
  
  describe('#cmd', function() {
    it('should register a new command (pattern)', function(done) {
      Bot().cmd(/hello/i, function(cmd) {
        cmd.message.should.equal('Hello');
        cmd.rawMessage.should.equal('Hello');
        cmd.context.should.deep.equal({ user: '1234', channel: '8642' });
        cmd.params.should.deep.equal([]);
        cmd.emit.should.be.a('function');
        cmd.format.should.be.a('function');
        cmd.error.should.be.a('function');
        cmd.result.should.be.a('function');
        cmd.result('Hello!');
      }).on('result', function(cmd, result) {
        result.should.equal('Hello!');
        done();
      }).exec('Hello', { user: '1234', channel: '8642' });
    });
    
    it('should register a new command (patterns)', function(done) {
      Bot().cmd([/hello/i, /hi/i], function(cmd) {
        cmd.result('Hello!');
      }).on('result', function(cmd, result) {
        result.should.equal('Hello!');
        done();
      }).exec('Hi');
    });
    
    it('should ')
  });
  
  // decribe('#use', function() {
  //   it('should attach a middleware', function() {
  //     Bot().use(function(){}).middleware.should.have.length(1);
  //   });
  // });
  //
  //
  // it('should')
});