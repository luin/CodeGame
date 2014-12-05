module.exports = function(map, a, b, callback) {
  process.stdout.write(a.UserId + '\t' + b.UserId + '\t');
  var start = Date.now();
  Game(map, a.code, b.code, function(err, replay) {
    var winner, loser;
    var result;
    if (replay.meta.result.winner === 0) {
      winner = a;
      loser = b;
      result = -1;
    } else {
      winner = b;
      loser = a;
      result = 1;
    }
    winner.win += 1;
    loser.lose += 1;
    var reason = replay.meta.result.reason;
    if (typeof winner.winReasons[reason] === 'undefined') {
      winner.winReasons[reason] = 1;
    } else {
      winner.winReasons[reason] += 1;
    }
    if (typeof loser.loseReasons[reason] === 'undefined') {
      loser.loseReasons[reason] = 1;
    } else {
      loser.loseReasons[reason] += 1;
    }
    process.stdout.write((result === -1 ? 'win' : 'lost') + '\t' + (Date.now() - start) + 'ms\n');
    process.nextTick(function() {
      callback(null, result);
    });
  });
};
