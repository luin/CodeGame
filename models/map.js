module.exports = function(DataTypes) {
  return [{
    name: DataTypes.STRING,
    type: { type: DataTypes.ENUM('general', 'tournament') },
    theme: DataTypes.STRING,
    data: DataTypes.TEXT
  }, {
    instanceMethods: {
      parse: function() {
        var DIRECTION = ['up', 'right', 'down', 'left'];
        var result = {
          players: []
        };
        var mapData = this.data.split('|').map(function(line, lineIndex) {
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
    }
  }];
};
