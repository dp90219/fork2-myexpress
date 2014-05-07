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
});
