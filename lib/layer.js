module.exports = function(route, fn) {
  this.route = route;
  this.handle = fn;
  this.match = function(str) {
    if (str.indexOf(this.route) == 0)
      return {path: this.route}
  }
}
