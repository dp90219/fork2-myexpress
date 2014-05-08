var http = require('http');


module.exports = function() {
  var index = 0;
  var app = function(req, res, next) {
    app.handle(req, res, next);
  };

  app.handle = function(req, res, next) {
    var stack = this.stack;
    this.stack.push({handle: function(err, req, res, next){
      if (err) {
        res.statusCode = 500;
        res.end();
      } else {
        next();
      }
    }});

    function next(err) {
      var layer = stack[index++];
      if (!layer) {
        res.statusCode = 404;
        res.end();
      }

      try {
        var arity = layer.handle.length;
        if (err) {
          if (arity === 4) {
            layer.handle(err, req, res, next);
          } else {
            next(err);
          }
        } else if (arity < 4) {
          layer.handle(req, res, next);
        } else {
          next();
        }
      } catch(e) {
        next(e);
      }
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
