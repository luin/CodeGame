if (require.main === module) {
  require('../env');
}

var async = require('async');
var tournamentId = process.argv[2];

var isend = false;

function calcFull(current) {
  var base = 1;
  while (current > base) {
    base *= 2;
  }
  return base;
}

function runCodes(maps, users, code, callback) {
  var score = [0, 0];
  async.mapSeries(maps, function(map, next) {
    Game(map.id, code[0].code, code[1].code, function(err, replay, _, result) {
      next(err, { replay: replay, resultId: result.id });
    });
  }, function(err, result) {
    result.forEach(function(r) {
      score[r.replay.meta.result.winner] += 1;
    });
    score.push({
      id: ++UID,
      users: users.map(function(user) {
        return {
          id: user.id,
          login: user.login,
          name: user.name
        };
      }),
      maps: maps.map(function(map) { return map.id; }),
      result: result.map(function(r) { return r.resultId; })
    });
    callback(null, score);
  });
}

var UID = 0;

var position3and4 = [];
Tournament.find({
  where: { id: tournamentId },
  include: [{ model: User }, { model: Map }]
}).then(function(tournament) {
  Code.findAll({
    where: { UserId: tournament.Users.map(function(user) { return user.id; }) }
  }).then(function(codes) {
    var result = {
      teams: [],
      results: []
    };
    var round = [];
    var players = tournament.Users.filter(function(user) {
      return codes.filter(function(code) {
        return code.UserId === user.id;
      }).length;
    }).sort(function(a, b) {
      var codea = codes.filter(function(code) {
        return code.UserId === a.id;
      })[0];
      var codeb = codes.filter(function(code) {
        return code.UserId === b.id;
      })[0];
      return (codea.rank || Number.MAX_VALUE) - (codeb.rank || Number.MAX_VALUE);
    });
    var allCount = calcFull(players.length);
    var diff = allCount - players.length;
    for (var i = 0; i < allCount; i += 2) {
      if (diff) {
        if (players.length >= 1) {
          round.push([players.shift(), '空缺']);
          diff -= 1;
        } else {
          round.push(['空缺', '空缺']);
          diff -= 2;
        }
      } else {
        if (players.length >= 2) {
          round.push([players.shift(), players.shift()]);
        } else if (players.length >= 1) {
          round.push([players.shift(), '空缺']);
        } else {
          round.push(['空缺', '空缺']);
        }
      }
    }
    var newRound = [];
    var length = round.length;
    while (round.length) {
      newRound.push(round.shift());
      newRound.push(round.pop());
    }
    round = newRound;
    round.forEach(function(couple) {
      result.teams.push(couple.map(function(user) {
        if (user === '空缺') {
          return user;
        }
        return { id: user.id, login: user.login, name: user.name };
      }));
    });
    async.whilst(function() {
      return round.length !== 0;
    }, function(callback) {
      console.log('Round: ' + round.length);
      async.mapSeries(round, function(item, next) {
        if (item[1] === '空缺') {
          return next(null, [tournament.Maps.length, 0]);
        }
        var code = item.map(function(user) {
          return codes.filter(function(code) {
            return user.id === code.UserId;
          })[0];
        });
        runCodes(tournament.Maps, item, code, next);
      }, function(err, scores) {
        result.results.push(scores);
        var newRound = [];
        if (round.length === 2 && !isend) {
          isend = true;
          var win = round.map(function(r, index) {
            if (scores[index][0] > scores[index][1]) {
              return r[0];
            } else {
              return r[1];
            }
          });
          var lose = round.map(function(r, index) {
            if (scores[index][0] < scores[index][1]) {
              return r[0];
            } else {
              return r[1];
            }
          });
          round = [win, lose];
          callback();
          return;
        }
        round = round.map(function(r, index) {
          if (scores[index][0] > scores[index][1]) {
            return r[0];
          } else {
            return r[1];
          }
        });
        round.forEach(function(player, index) {
          if (index % 2) {
            newRound.push([round[index - 1], player]);
          }
        });
        round = newRound;
        callback();
      });
    }, function() {
      tournament.result = JSON.stringify(result);
      tournament.save().then(function() {
        process.exit(0);
      });
    });
  });
});
