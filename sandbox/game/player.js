var vm = require('vm');
var Sandbox = require('./sandbox');
var Movable = require('./movable');
var utils   = require('./utils');

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

  this.sandbox = new Sandbox();
  var start = Date.now();
  try {
    vm.createScript(code).runInNewContext(this.sandbox, {
      timeout: 1500
    });
  } catch (e) {
    this.error = e;
    this._log('error', e.message);
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

    this.sandbox.print = function(data) {
      try {
        var json = JSON.stringify(data);
        _this.logLength += json.length;
        if (_this.logLength > 200000) {
          _this._log('warn', e.message, game.frames);
        } else {
          _this._log('debug', data, game.frames);
        }
      } catch (err) {
        _this.error = e;
        _this._log('error', e.message, game.frames);
      }
    };
    this.script.runInNewContext(this.sandbox, {
      timeout: 1500
    });
  } catch (e) {
    this.error = e;
    this._log('error', e.message, game.frames);
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
