module.exports = function(route, fn) {
  this.route = route;
  this.handle = fn;
  this.match = function(str) {
    if (this.route == '/') 
      return {path: '/'};
    if (str == this.route || str.indexOf(this.route + '/') == 0)
      return {path: this.route};
  }
}
