var mime = require('mime');
var accepts = require('accepts');
var http = require('http');

var proto = {};
proto.isExpress = true;
proto.__proto__ = http.ServerResponse.prototype;
proto.redirect = function(statusCode, url) {
  if (!url) {
    url = statusCode;
    statusCode = 302;
  }

  this.writeHead(statusCode, {
    Location: url,
    "Content-Length": 0
  });
  this.end();

};

proto.type = function(typeName) {
  this.setHeader("Content-Type", mime.lookup(typeName));
}

proto.default_type = function(typeName) {
  if (!this.getHeader('content-type'))
    this.setHeader("Content-Type", mime.lookup(typeName));
}

proto.format = function(dict) {
  var formats = Object.keys(dict);
  var accept = accepts(this.req);
  var typeName = accept.types(formats);

  if (formats.indexOf(typeName) == -1) {
    // var err = new Error("Not Acceptable");
    this.statusCode = 406;
    this.end();

  } else {
    this.type(typeName);
    dict[typeName]();
  }

}



module.exports = proto;
