var express = require('../index');
var request = require('supertest');
var http = require('http');
var expect = require('chai').expect;

describe('app', function() {
  var app = express();
  describe('create http server', function() {
    it("responds to /foo with 404", function(done){
      var server = http.createServer(app);
      request(server).get('/foo').expect(404).end(done);
    });
  });

  describe('#listen', function() {
    var port = 7000;
    var server;

    before(function(done) {
      server = app.listen(port, done);
    });

    it('should return an http.Server', function() {
      expect(server).to.be.instanceof(http.Server);
    });
    
    it('should responds /foo with 404', function(done){
      request('localhost:' + port).get('/foo').expect(404).end(done);
    });
  });

  describe(".use", function() {
    describe("calling middleware stack", function() {
      var app;
      beforeEach(function() {
        app = express();
      });
      it('should call a single middleware', function(done) {
        var m1 = function(req, res, next) {
          res.end("hello from m1");
        };
        app.use(m1);
        request(app).get('/').expect('hello from m1').end(done)
      })
    });
  });
});
