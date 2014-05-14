var http = require('http');
var Layer = require('./lib/layer');

module.exports = function() {
  var app = function(req, res, next) {
    app.handle(req, res, next);
  };

  app.handle = function(req, res, out) {
    var stack = this.stack;
    var index = 0;
    function next(err) {
      var layer = stack[index++];
      if (!layer) {


        if(err) {
          if (out) {
            req.url = req.prefix + req.url;
            // console.log("OUT: ", req.url);
            out(err);
          } else {
            res.statusCode = 500;
            res.end();
          }
        } else {
          if (out) {
            req.url = req.prefix + req.url;
            // console.log("OUT: ", req.url);
            out(err);
          } else {

            res.statusCode = 404;
            res.end();
          }
        }
        return;
      }

      if (layer.match(req.url)) {
        // if layer.fn is an app
        if ('function' == typeof layer.handle.handle) {
          var subapp = layer.handle;
          req.prefix = layer.route;
          req.url = req.url.slice(layer.route.length);
          // console.log("IN: " + req.url);
          subapp(req, res, next);

        } else {

          req.params = layer.match(req.url).params;
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
      } else {
        next(err);
      }
    }

    next();

  };

  app.use = function(route, fn) {
    if (!fn) {
      fn = route;
      route = '/';
    }

    // if ('function' == typeof fn.handle) {
    //   var server = fn;
    //   fn = function(req, res, next) {
    //     server.handle(req, res, next);
    //   }
    // }

    var layer = new Layer(route, fn);
    this.stack.push(layer);
    return this;
  }

  app.listen = function() {
    var server = http.createServer(this);
    return server.listen.apply(server, arguments);
  };
  
  app.stack = [];
  return app;
}
