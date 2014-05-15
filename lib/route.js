
module.exports = function makeRoute(verb, handler) {
  if (!verb && !handler) {
    var route = function(req, res, next) {};
    route.stack = [];
    route.use = function(verb, handler) {
      route.stack.push({"verb": verb, "handler": handler})
    }

    return route;
  } else {
    return function(req, res, next) {
      if (req.method == verb) {
        handler(req, res, next);
      } else {
        res.statusCode = 405;
        res.end('404 Not Found');
      }
    }
  }
}
