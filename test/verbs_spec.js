var request = require('supertest')
  , expect = require('chai').expect
  , http = require('http');

var express = require('../');

describe('App get method', function() {
  var app;
  before(function() {
    app = express();
    app.get('/foo', function(req, res) {
      res.end('foo');
    });
  });

  it('should respond  for GET request', function(done) {
    request(app).get('/foo').expect('foo').end(done);
  });

  it('should 404 for non GET requests', function(done){
    request(app).post('/foo').expect(404).end(done);
  });

  it('should 404 for non whole path path', function(done) {
    request(app).get('/foo/bar').expect(404).end(done);
  });
})
