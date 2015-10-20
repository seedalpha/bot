var should  = require('chai').should();
var through = require('through2').obj;
var Bot     = require('../');

describe('Bot', function() {
  
  describe('#constructor', function() {
    it('should create an instance', function() {
      Bot().should.be.instanceof(Bot);
      (new Bot).should.be.instanceof(Bot);
    });
  });
  
  describe('#cmd', function() {
    it('should register a new command (pattern)', function(done) {
      Bot()
        .cmd(/hello/i, function(cmd) {
          cmd.message.should.equal('Hello');
          cmd.rawMessage.should.equal('Hello');
          cmd.context.should.deep.equal({ user: '1234', channel: '8642' });
          cmd.params.should.deep.equal([]);
          cmd.options.should.deep.equal({});
          cmd.send.should.be.a('function');
          cmd.log.should.be.a('function');
          cmd.send(cmd.context.channel, 'hello!');
        })
        .exec('Hello', { user: '1234', channel: '8642' })
        .stream().pipe(through(function(chunk, enc, cb) {
          chunk[0].should.equal('8642');
          chunk[1].should.equal('hello!');
          done();
        }));
    });
    
    it('should register a new command (patterns)', function(done) {
      Bot({ debug: true }).cmd([/hello/i, /hi/i], function(cmd) {
        cmd.options.debug.should.equal(true);
        cmd.send(cmd.context.channel, 'Hello!');
      }).on('send', function(channel, message) {
        channel.should.equal('1234');
        message.should.equal('Hello!');
        done();
      }).exec('Hi', { channel: '1234' });
    });
  });
  
  describe('#use', function() {
    it('should attach a middleware', function() {
      Bot().use(function(cmd, next){}).middleware.should.have.length(1);
    });
    
    it('should run middleware before a command', function(done) {
      Bot().use(function(cmd, next){
        cmd.should.be.an('object');
        cmd.trigger = true;
        next();
      }).cmd(/.*/, function(cmd, next) {
        cmd.should.be.an('object');
        cmd.innerTrigger = true
        next();
      }, function(cmd) {
        cmd.trigger.should.equal(true);
        cmd.innerTrigger.should.equal(true);
        done();
      }).exec('boom');
    });
  });
  
  describe('#send', function() {
    it('should send message', function(done) {
      Bot().on('send', function(channel, message) {
        channel.should.equal('channel');
        message.should.equal('message');
        done();
      }).send('channel', 'message');
    });
    
    it('should queue message to stream', function(done) {
      Bot().send('channel', 'message').stream().pipe(through(function(chunk) {
        chunk[0].should.equal('channel');
        chunk[1].should.equal('message');
        done();
      }));
    });
  });
});