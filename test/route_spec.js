var request = require('supertest')
  , expect = require('chai').expect
  , http = requrie('http');

var express = require('../');
var makeRoute = require('../lib/route');

describe('Add handlers to a route', function() {
  var route, handler1, handler2;
  before(function() {
    route = makeRoute();
    handler1 = function() {};
    handler2 = function() {};

    route.use('get', handler1);
    route.use('post', handler2);
  });

  it('adds mutiple handlers to route', function() {
    expect(route.stack).to.have.length(2);
  });
})


