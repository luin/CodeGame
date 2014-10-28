var utils = require('./utils');
var Player = require('./player');

var Game = module.exports = function(mapData, options) {
  mapData = parseMap(mapData);

  this.players = mapData.players.map(function(player, index) {
    return new Player(player.direction, player.position, options.AI[index]);
  });

  this.map = mapData.map;

  this.frames = {
    current: 0,
    total: options.frames || 200
  };

  this.star = {
    interval: options.interval || 10,
    position: null
  };
};

Game.prototype.clone = function() {
  return {
    players: this.players.map(function(player) {
      return player.clone();
    }),
    map: this.map.slice().map(function(line) {
      return line.slice();
    }),
    frames: utils.clone(this.frames),
    star: utils.clone(this.star),
  };
};

var DIRECTION = ['up', 'right', 'down', 'left'];

function parseMap(mapData) {
  var result = {
    players: []
  };
  mapData = mapData.split(/[\r\n]+/).filter(function(line) {
    return line.length;
  }).map(function(line, lineIndex) {
    return line.split('').map(function(c, charIndex) {
      var index;
      index = ['a', 'b', 'c', 'd'].indexOf(c);
      if (index !== -1) {
        result.players[0] = {
          direction: DIRECTION[index],
          position: [charIndex, lineIndex]
        };
        return '.';
      }
      index = ['A', 'B', 'C', 'D'].indexOf(c);
      if (index !== -1) {
        result.players[1] = {
          direction: DIRECTION[index],
          position: [charIndex, lineIndex]
        };
        return '.';
      }
      return c;
    });
  });
  result.map = [];

  for (var j = 0; j < mapData.length; ++j) {
    for (var i = 0; i < mapData[j].length; ++i) {
      if (!result.map[i]) {
        result.map[i] = [];
      }
      result.map[i][j] = mapData[j][i];
    }
  }

  return result;
}
