module.exports = function(DataTypes) {
  return [{
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: { type: DataTypes.ENUM('general', 'tournament', 'rank') },
    theme: DataTypes.STRING,
    data: {
      type: DataTypes.TEXT,
      validate: {
        isValidMapData: parseMapData
      }
    }
  }, {
    instanceMethods: {
      parse: function() {
        return parseMapData(this.data);
      }
    }
  }];
};

function parseMapData(data) {
  var DIRECTION = ['up', 'right', 'down', 'left'];
  var result = {
    players: []
  };

  var cols;
  var mapData = data.split('|').map(function(line, lineIndex) {
    if (typeof cols === 'undefined') {
      cols = line.length;
    }

    if (line.length != cols) {
      throw Error('Not all rows have same length');
    }
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
      if (!(c == 'x' || c == 'o' || c == '.')) {
        throw Error('Invalid map tile type:' + c);
      }
      return c;
    });
  });

  if (!(result.players[0] && result.players[1])) {
    throw Error('Need starting location for two players');
  }

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
