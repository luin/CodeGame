var Sandbox = module.exports = function(sandbox) {
  var math = this.Math = {};
  ['abs', 'acos', 'asin', 'atan', 'atan2', 'ceil',
  'cos', 'exp', 'floor', 'log', 'max', 'min', 'pow', 'round', 'sin', 'sqrt', 'tan'].forEach(function(method) {
    math[method] = Math[method];
  });

  this.parseInt = parseInt;

  for (var key in sandbox) {
    if (sandbox.hasOwnProperty(key)) {
      this[key] = sandbox[key];
    }
  }
};
