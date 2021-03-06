var http = require('http');
var methods = require('methods');
var Layer = require('./lib/layer');
var makeRoute = require('./lib/route');
var createInjector = require('./lib/injector');
var reqProto = require('./lib/request');
var resProto = require('./lib/response');

module.exports = function() {
  var app = function(req, res, out) {
    app.monkey_patch(req, res);
    req.app = app;
    app.handle(req, res, out);
  };

  app.handle = function(req, res, out) {
    if(!req.prefix) req.prefix = [];
    var stack = this.stack;
    var index = 0;
    function next(err, isSub) {
      //
      if (isSub)
        req.app = app;

      var layer = stack[index++];
      if (!layer) {
        if(err) {
          if (out) {
            req.url = req.prefix.pop() + req.url;
            out(err, isSub=true);
          } else {
            res.statusCode = 500;
            res.end();
          }
        } else {
          if (out) {
            req.url = req.prefix.pop() + req.url;
            out(err, isSub=true);
          } else {

            res.statusCode = 404;
            res.end();
          }
        }
        return;
      }

      if (layer.match(req.url)) {
        // if layer.fn is an app or route
        if ('function' == typeof layer.handle.handle) {
          var subapp = layer.handle;
          req.prefix.push(layer.path);
          req.url = req.url.slice(layer.path.length);
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

  app.use = function(path, fn) {
    if (!fn) {
      fn = path;
      path = '/';
    }

    var layer = new Layer(path, fn);
    this.stack.push(layer);
    return this;
  }

  app.route = function(path, options) {
    var route = makeRoute();
    var layer = new Layer(path, route, options);
    this.stack.push(layer);
    return route;
  }

  methods.forEach(function(method) {
    app[method] = function(path, handler) {
      this.route(path, {end: true})[method](handler);
      return this;
    }
  })

  app.listen = function() {
    var server = http.createServer(this);
    return server.listen.apply(server, arguments);
  };

  app.factory = function(name, fn) {
    this._factories[name] = fn;
  }

  app.inject = function(handler) {
    return createInjector(handler, app);
  }
  
  app.monkey_patch = function(req, res) {
    req.__proto__ = reqProto;
    res.__proto__ = resProto;
    res.__proto__.req = req;
    req.__proto__.res = res;
  }

  app.stack = [];
  app._factories = {};
  return app;

}
