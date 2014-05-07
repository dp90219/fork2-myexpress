var connect = require('connect');

var app;

module.exports = function() {
  app = connect();
  return app;
}
