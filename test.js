var express = require('./index');
// 
var app = express();
// var subapp = express();
// 
// subapp.use("/bar",function(req,res) {
//   res.end("embedded app: " + req.url);
// });
// 
// // app.use(function(req, res, next) {
// //   res.write('hello\n');
// //   res.write(req.url);
// //   res.write('\n');
// //   next();
// // });
// 
// app.use('/foo', subapp);
// 
// app.use("/foo",function(req,res) {
//   res.end("handler: " + req.url);
// });

app.use(function(req, res) {
  res.format({});
});

app.listen(6000)
