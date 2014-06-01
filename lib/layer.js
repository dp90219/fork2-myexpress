var p2re = require('path-to-regexp');

module.exports = function(path, fn, option) {
  this.path = path;
  this.handle = fn;

  var names = [],
      // !!undefined == false
      optional = {end: !!option},
      pathTrimSlash = path,
      re;
  // edge case for '/', '/foo/'
  if (path.slice(-1) == '/')
    pathTrimSlash = path.slice(0, -1);

  re = p2re(pathTrimSlash, names, optional);

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
