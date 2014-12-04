var vm = require('vm');
var Sandbox = require('./sandbox');
var Movable = require('./movable');
var seedrandom = require('seedrandom');

var crypto = require('crypto');
var md5 = function(value) {
  return crypto.createHash('md5').update(value).digest('hex');
};

var Player = module.exports = function(direction, position, code) {
  this.tank = new Movable(direction, position);

  this.bullet = null;
  this.stars = 0;
  this.pendingCommands = [];

  this.code = code;
  this.runTime = 0;

  this.error = null;
  this.logs = [];
  this.logLength = 0;
  this.logCount = 0;

  this.sandbox = new Sandbox();
  var _this = this;
  this.sandbox.Math.random = function() {
    if (typeof _this.random === 'undefined') {
      _this.random = seedrandom(md5(code));
    }
    return _this.random.apply(this, arguments);
  };
  var start = Date.now();
  try {
    vm.createScript(code).runInNewContext(this.sandbox, {
      timeout: 1500
    });
  } catch (e) {
    this.error = e;
    this._log('error', JSON.stringify(e.message));
  }
  this.runTime += Date.now() - start;

  if (!this.error && (!this.sandbox.onIdle && typeof onIdle !== 'function')) {
    this.error = new Error('Cannot find function "onIdle".');
  }
};

Player.prototype._log = function(type, data, frame) {
  this.logs.push({
    type: type,
    data: data,
    frame: frame || 0,
    runTime: this.runTime
  });
};

Player.prototype.onIdle = function(self, enemy, game) {
  var code = 'onIdle(__self, __enemy, __game);';
  if (!this.script) {
    this.script = vm.createScript(code);
  }
  var start = Date.now();
  try {
    var _this = this;
    this.sandbox.__self = self;
    this.sandbox.__enemy = enemy;
    this.sandbox.__game = game;

    if (this.stopLog) {
      this.sandbox.print = function() {};
    } else {
      this.sandbox.print = function(data) {
        try {
          var json = JSON.stringify(data);
          if (typeof json === 'undefined') {
            return;
          }
          _this.logLength += json.length;
          _this.logCount += 1;
          if (_this.logLength > 100000 || _this.logCount > 256) {
            _this._log('warn', JSON.stringify('日志长度超限，之后的日志将被忽略'), game.frames);
            _this.stopLog = true;
            _this.sandbox.print = function() {};
          } else {
            _this._log('debug', json, game.frames);
          }
        } catch (err) {
          _this.error = err;
          _this._log('error', JSON.stringify(err.message), game.frames);
        }
        return;
      };
    }
    this.script.runInNewContext(this.sandbox, {
      timeout: 1500
    });
  } catch (err) {
    this.error = err;
    this._log('error', JSON.stringify(err.message), game.frames);
  }
  this.runTime += Date.now() - start;
};

Player.prototype.clone = function() {
  return {
    tank: this.tank.clone(),
    bullet: this.bullet ? this.bullet.clone() : null,
    stars: this.stars
  };
};
