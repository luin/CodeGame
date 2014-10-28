var Sandbox = module.exports = function(sandbox) {
  this.Math = Math;
  this.parseInt = parseInt;

  for (var key in sandbox) {
    if (sandbox.hasOwnProperty(key)) {
      this[key] = sandbox[key];
    }
  }
};
