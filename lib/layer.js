var p2re = require('path-to-regexp');

module.exports = function(route, fn, option) {
  this.route = route;
  this.handle = fn;

  var names = [],
      optional = {end: !!option},
      routeTrimSlash = route,
      re;
  // edge case for '/', '/foo/'
  if (route.slice(-1) == '/')
    routeTrimSlash = route.slice(0, -1);

  re = p2re(routeTrimSlash, names, optional);

  this.match = function(str) {
    str = decodeURIComponent(str);
    if (re.test(str)) {
      var m = re.exec(str);
      var result = {};
      result.path = m[0];
      result.params = {};
      var i = 1;
      names.forEach(function(item, i) {
        result.params[item.name] = m[i+1];
      });
      return result;
    }

  }
}
