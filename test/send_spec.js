var request = require('supertest')
  , expect = require('chai').expect
  , http = require('http');

var express = require('../');

describe("res.send: ", function() {
  var app;
  beforeEach(function() {
    app = express();
  });


  describe("support buffer and string body: ", function() {
    beforeEach(function() {
      app.use('/buffer', function(req, res) {
        res.send(new Buffer("binary data"));
      });

      app.use('/string', function(req, res) {
        res.send('string data');
      });

      app.use('/json', function(req, res) {
        res.type('json');
        res.send('[1, 2, 3]');
      });
    });

    it('responds to buffer', function(done) {
      request(app).get('/buffer')
        .expect("binary data")
        .expect('Content-Type', 'application/octet-stream')
        .end(done);
    }); 

    it("responds to string", function(done) {
      request(app).get('/string')
        .expect('string data')
        .expect('Content-Type', 'text/html')
        .end(done);
    });

    it("should not override existing content-type", function(done) {
      request(app).get('/json')
        .expect("[1, 2, 3]")
        .expect("Content-Type", "application/json")
        .end(done);
    });
  });

  describe("sets content-type:", function() {
    beforeEach(function() {
      app.use('/buffer', function(req, res) {
        res.send(new Buffer("abc"));
      });

      app.use('/string', function(req, res) {
        res.send("你好吗");
      });
    });

    it("responds with byte length of unicode string", function(done) {
      request(app).get('/string')
        .expect("Content-Length", 9).end(done);
    });
    
    it("responds with byte length of buffer", function(done) {
      request(app).get('/buffer')
        .expect("Content-Length", 3).end(done);
    });
  });

  describe("sets status code: ", function() {
    beforeEach(function() {
      app.use('/foo', function(req, res) {
        res.send('foo ok');
      });
      app.use('/bar', function(req, res) {
        res.send(201, 'bar created');
      });
      app.use('/201', function(req, res){
        res.send(201);
      });
    });

    it("defaults status code to 200", function(done) {
      request(app).get('/foo').expect(200, 'foo ok').end(done);
    });

    it("can respond with a give status code", function(done) {
      request(app).get('/bar').expect(201).end(done);
    });

    it("responds with default status code when body is only stauts code given", function(done) {
      request(app).get('/201').expect(201, 'Created').end(done);
    });
  });

  describe("JSON response", function() {
    beforeEach(function() {
      app.use(function(req, res) {
        res.send({foo: [1, 2, 3]});
      });
    });
    it("returns a JSON as response", function(done) {
      request(app).get('/')
        .expect('{"foo":[1,2,3]}')
        .expect("Content-Type", "application/json")
        .end(done);
    });
  });
});
