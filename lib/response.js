var mime = require('mime');
var accepts = require('accepts');
var http = require('http');
var Buffer = require('buffer').Buffer;
var crc32 = require('buffer-crc32');
var fs = require('fs');
var rparser = require('range-parser');



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
  if (!this.getHeader('content-type')) // getHeader is case-insensitive
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

proto.etag = function(body) {
  if(this.req.method === "GET" && !this.getHeader('ETag') && body.length != 0) {
    this.setHeader("ETag", crc32.unsigned(body).toString());
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
    this.etag(body);
    if (this.req.headers["if-none-match"] === this.getHeader('ETag')) {
      this.statusCode = 304;
      this.end();
    }

    if(Date.parse(this.req.headers["if-modified-since"]) >=  Date.parse(this.getHeader("last-modified"))) {
      this.statusCode = 304;
      this.end();
    }

    this.setHeader("Content-Length", Buffer.byteLength(body));
    this.end(body);
  }

}


proto.stream = function(streamFile) {
  var res = this;
  if (res.req.method != "HEAD")
    streamFile.pipe(res);
  else
    res.end();
}


proto.sendfile = function(path, options) {
  res = this;
  res.setHeader("Accept-Range", "bytes");
  res.type('text');
  var filename;
  if (!options) {
    filename = path;
  } else {
    var filename = options.root + path;
  }
  if (filename.indexOf('..') != -1) {
    res.statusCode = 403;
    res.end();
    return;
  }

  filename = require('path').normalize(filename)

  fs.exists(filename, function(exists) {
    if (!exists) {
      res.statusCode = 404;
      res.end();
    } else {
      fs.stat(filename, function(err, stats) {
        if (stats.isDirectory()) {
          res.statusCode = 403;
          res.end();
        }
        if (stats.isFile()) {
          var file;
          var len = stats.size;
          res.setHeader("Content-Length", len);
          if (res.req.headers.range) {
            r = rparser(len, res.req.headers.range);
            if (r == -1) {
              res.statusCode = 416;
              res.end();
              return;
            } else if (r == -2){
              file = fs.createReadStream(filename);
            } else {
              file = fs.createReadStream(filename, r[0]);
              res.setHeader("Content-Range", "bytes " + r[0].start + '-' + r[0].end + "/" + len);
              res.statusCode = 206;
            }
          } else {
            file = fs.createReadStream(filename);
          }
          res.stream(file);
        }
      });
    }
  });
}


module.exports = proto;
