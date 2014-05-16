var methods = require('methods');
methods.push('all');

module.exports = function(verb, handler) {
  if (!verb && !handler) {
    var route = function(req, res, out) {
      route.handle(req, res, out);
    }
    route.handle = function(req, res, out) {
      var stack = this.stack;
      var index = 0;
      (function next(err) {
        if (err == 'route') out();
        if (err) out(err);
        var layer = stack[index++];
        if (layer === undefined) {
          out();
        } else {
          try {
            if (layer.verb === 'all') {
              layer.handler(req, res, next);
            } else if (req.method === layer.verb.toUpperCase()) {
              layer.handler(req, res, next);
            } else {
              next();
            }
          } catch(e) {
            next(e);
          }
        }
      })();
    };

    route.stack = [];

    route.use = function(method, handler) {
      this.stack.push({"verb": method, "handler": handler});
      // console.log({"verb": method, "handler": handler});
      return this;
    }

    // methods = ['post'];
    // route.post = function(handler) {
    //   route.use('post', handler);
    // }
    methods.forEach(function(method) {
      route[method] = function(handler) {
        this.use(method, handler);
        return this;
      }
    });

    return route;
  } else {
    return function(req, res, next) {
      if (req.method == verb) {
        handler(req, res, next);
      } else {
        res.statusCode = 404;
        res.end('404 Not Found');
      }
    }
  }
}
