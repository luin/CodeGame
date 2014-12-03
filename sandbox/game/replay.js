var Replay = module.exports = function(game) {
  this.game = game;
  this.data = {
    meta: {
      players: game.players.map(function(player) {
        return {
          tank: player.tank.clone()
        };
      })
    },
    records: []
  };
};

Replay.prototype.record = function(data) {
  this.getRecord().push(data);
};

Replay.prototype.getRecord = function() {
  var key = this.game.frames - 1;
  if (typeof this.data.records[key] === 'undefined') {
    this.data.records[key] = [];
  }
  return this.data.records[key];
};

Replay.prototype.end = function(result) {
  this.data.meta.result = result;
  for (var i = 0; i < this.game.frames - 1; ++i) {
    if (typeof this.data.records[i] === 'undefined') {
      this.data.records[i] = [];
    }
  }
};

Replay.prototype.setRecord = function(record) {
  this.data.records[this.game.frames - 1] = record;
};

Replay.prototype.clone = function() {
  var _this = this;
  this.game.players.forEach(function(player, index) {
    var metaPlayer = _this.data.meta.players[index];
    metaPlayer.runTime = player.runTime;
    metaPlayer.logs = player.logs;
  });
  this.data.records = this.data.records.map(function(record) {
    return Array.isArray(record) ? record : [];
  });
  return this.data;
};
