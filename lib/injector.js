
module.exports = function createInjector(handler, app) {
  var injector = function(req, res, next) {
    var loader = injector.dependencies_loader(req, res, next);
    loader(function(err, values) {
      if (err) {
        next(err);
      } else {
        handler.apply(this, values);
      }
    });
  };

  injector.extract_params =  function () {
    var fnText = handler.toString();
    if (this.extract_params.cache[fnText]) {
      return this.extract_params.cache[fnText];
    }

    var FN_ARGS        = /^function\s*[^\(]*\(\s*([^\)]*)\)/m,
        FN_ARG_SPLIT   = /,/,
        FN_ARG         = /^\s*(_?)(\S+?)\1\s*$/,
        STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;

    var inject = [];
    var argDecl = fnText.replace(STRIP_COMMENTS, '').match(FN_ARGS);
    argDecl[1].split(FN_ARG_SPLIT).forEach(function(arg) {
      arg.replace(FN_ARG, function(all, underscore, name) {
        inject.push(name);
      });
    });

    this.extract_params.cache[fnText] = inject;
    return inject;
  };

  injector.extract_params.cache = {};

  injector.dependencies_loader = function(req, res, next) {
    var dict = {req: req, res: res, next: next};

    Object.keys(dict).forEach(function(each) {
      app.factory(each, function(req, res, next) {
        next(null, dict[each]);
      });
    });

    // console.log(app._factories);

    var params = this.extract_params();
    // console.log("params: " + params);

    return function(callback) {
      var values = [];
      var error = null;
      var index = 0;
      var factories = app._factories;

      (function next(err, value) {
        if (err) {
          error = err;
          return;
        }
        if (value)
          values.push(value);
        
        var name = params[index++];
        if (!name)
          return
        var factory = factories[name];
      
        if (!factory) {
          error = new Error("Factory not defined: " + name);
          return;
        }
        try {
          // console.log("name: " + name);
          // console.log("factory: " + factory);
          factory(req, res, next);
        } catch(e) {
          error = e;
        }
      })();

      // console.log("values: " + values);
      callback(error, values);
    }
  }

  return injector;
};
