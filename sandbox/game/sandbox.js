module.exports = function(sandbox) {
  var sandMethod = function(method, thisObj) {
    if (typeof thisObj === 'undefined') {
      thisObj = null;
    }
    return function() {
      return method.apply(thisObj, arguments);
    };
  };
  var math = this.Math = {};
  ['abs', 'acos', 'asin', 'atan', 'atan2', 'ceil',
  'cos', 'exp', 'floor', 'log', 'max', 'min', 'pow', 'round', 'sin', 'sqrt', 'tan'].forEach(function(method) {
    math[method] = sandMethod(Math[method]);
  });

  this.parseInt = sandMethod(parseInt);
  this.parseFloat = sandMethod(parseFloat);
  this.Date = null;

  for (var key in sandbox) {
    if (sandbox.hasOwnProperty(key)) {
      this[key] = sandbox[key];
    }
  }
};
