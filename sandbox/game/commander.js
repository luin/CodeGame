var Commander = module.exports = function(player) {
  for (var key in player) {
    if (player.hasOwnProperty(key)) {
      this[key] = player[key];
    }
  }
  this.__queue = [];
};

Commander.prototype.__push = function(command) {
  this.__queue.push(command);
};

Commander.prototype.turn = function(direction) {
  this.__push(direction);
};

Commander.prototype.go = function(steps) {
  if (typeof steps !== 'number') {
    steps = 1;
  }
  while (steps--) {
    this.__push('go');
  }
};

Commander.prototype.fire = function() {
  this.__push('fire');
};
