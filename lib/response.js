var mime = require('mime');
var accepts = require('accepts');
var http = require('http');
var Buffer = require('buffer').Buffer;

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
    // err.statusCode = 406;
    this.statusCode = 406;
    this.end();
    // throw err;

  } else {
    this.type(typeName);
    dict[typeName]();
  }

}

proto.send = function(statusCode, body) {
  if (typeof statusCode != 'number') {
    body = statusCode;
  } else {
    if (!body) {
      body = http.STATUS_CODES[statusCode.toString()];
    }

    this.statusCode = statusCode;
    this.end(body);
  }

  if (typeof body == 'object') {
    if (Buffer.isBuffer(body)) {
      this.default_type('bin');
      this.setHeader("Content-Length", body.length);
      this.end(body);
    } else {

      this.type('json');
      this.send(JSON.stringify(body));
    }

  }

  if (typeof body == 'string') {
    this.default_type('html');
    this.setHeader("Content-Length", Buffer.byteLength(body));
    this.end(body);
  }

}


module.exports = proto;
