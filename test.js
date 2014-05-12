var express = require('./index');

var app = express();

app.use("/foo",function(req,res,next) {
  res.end("foo");
});

app.use("/",function(req,res) {
  res.end("root");
});


app.listen(6000)
