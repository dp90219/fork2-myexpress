var http = require('http');


module.exports = function() {
  var index = 0;
  var app = function(req, res, next) {
    app.handle(req, res, next);
  };

  app.handle = function(req, res, next) {
    var stack = this.stack;
    function next() {
      var layer = stack[index++];
      if (!layer) {
        res.statusCode = 404;
        res.end();
        return;
      }
      layer.handle(req, res, next);
    }

    next();

  };

  app.use = function(fn) {
    this.stack.push({handle: fn});
    return this;
  }

  app.listen = function() {
    var server = http.createServer(this);
    return server.listen.apply(server, arguments);
  };
  
  app.stack = [];
  return app;
}
