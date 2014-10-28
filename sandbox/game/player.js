var vm      = require('vm');
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

  this.sandbox = new Sandbox();
  var start = Date.now();
  try {
    vm.createScript(code).runInNewContext(this.sandbox, {
      timeout: 500
    });
  } catch (e) {
    this.error = e;
    this.logs.push({
      type: 'error',
      frame: 0,
      runTime: this.runTime,
      escaped: true,
      data: e.message
    });
  }
  this.runTime += Date.now() - start;

  if (!this.error && !this.sandbox.onIdle) {
    this.error = new Error('Cannot find function "onIdle".');
  }
};

Player.prototype.onIdle = function(self, enemy, game) {
  if (!this.script) {
    this.script = vm.createScript('onIdle(__self, __enemy, __game);');
  }
  var start = Date.now();
  try {
    this.sandbox.__self = self;
    this.sandbox.__enemy = enemy;
    this.sandbox.__game = game;

    var _this = this;
    this.sandbox.print = function(data) {
      _this.logs.push({
        type: 'debug',
        frame: game.frames.current,
        runTime: _this.runTime,
        data: data
      });
    };
    this.script.runInNewContext(this.sandbox, {
      timeout: 500
    });
  } catch (e) {
    this.error = e;
    this.logs.push({
      type: 'error',
      frame: game.frames.current,
      runTime: this.runTime,
      escaped: true,
      data: e.message
    });
  }
  this.runTime += Date.now() - start;
};

Player.prototype.clone = function() {
  return {
    tank: this.tank.clone(),
    bullet: this.bullet ? this.bullet.clone() : null
  };
};
