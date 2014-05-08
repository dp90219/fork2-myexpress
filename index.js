var http = require('http');

module.exports = function() {
  var app = function(req, res, next) {
    app.handle(req, res, next);
  };

  app.handle = function(req, res, next) {
    var stack = this.stack;
    res.statusCode = 404;
    res.end();
  };

  app.use = function(fn) {
    this.stack.push(fn);
  }

  app.listen = function() {
    var server = http.createServer(this);
    return server.listen.apply(server, arguments);
  };
  
  app.stack = [];
  return app;
}
