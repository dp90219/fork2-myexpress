
module.exports = function createInjector(handler, app) {
  var injector = {};
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
    var params = this.extract_params();

    params.forEach(function(param) {
      if (param == 'req' || param == 'res' || param == 'next') {
        app.factory(param, function(req, res, next) {
          next(null, dict[param]);
        });
      }
    });

    return function(callback) {
      var values = [];
      var error;
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
        var factory = factories[name];
        if (!factory) {
          error = new Error("Factory not defined: " + name);
          return;
        }
        try {
          factory(req, res, next)
        } catch(e) {
          error = e;
        }
      })();

      callback(error, values);
    }
  }

  return injector;
};
