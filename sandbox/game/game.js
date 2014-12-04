var Player = require('./player');

var Game = module.exports = function(parsedMap, options) {
  this.players = parsedMap.players.map(function(player, index) {
    return new Player(player.direction, player.position, options.AI[index]);
  });

  this.map = parsedMap.map;

  this.frames = 0;

  this.star = null;
  this.lastCollectedStar = Number.NEGATIVE_INFINITY;
};

Game.prototype.clone = function() {
  return {
    players: this.players.map(function(player) {
      return player.clone();
    }),
    map: this.map.slice().map(function(line) {
      return line.slice();
    }),
    frames: this.frames,
    star: this.star ? this.star.slice() : null
  };
};
