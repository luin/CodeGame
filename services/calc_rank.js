if (require.main === module) {
  require('../env');
}

var Sequelize = require('sequelize');
var async = require('async');
var aqsort = require('aqsort');

var round = 0;
function runCodes(a, b, callback, skipCalc) {
  console.log('Testing ' + a.UserId + ' vs ' + b.UserId);
  round += 1;
  var pending = 2;
  var codes = [a, b];
  var results = [];
  var next = function() {
    var points = [0, 0];
    results.forEach(function(result, index) {
      if (result.winner === codes[0].UserId) {
        points[0] += 1;
        if (!skipCalc) {
          codes[0].win += 1;
          codes[1].lost += 1;
        }
      } else {
        points[1] += 1;
        if (!skipCalc) {
          codes[1].win += 1;
          codes[0].lost += 1;
        }
      }
    });
    if (points[0] > points[1]) {
      callback(null, -1);
    } else if (points[0] === points[1]) {
      callback(null, 0);
    } else {
      callback(null, 1);
    }
  };
  Result.find({ where: { user1: codes[0].UserId, user2: codes[1].UserId } }).done(function(err, result) {
    if (result) {
      results[0] = result;
      if (!--pending) {
        next();
      }
    } else {
      Game(codes[0].code, codes[1].code, function(err, record) {
        Result.create({
          user1: codes[0].UserId,
          user2: codes[1].UserId,
          record: JSON.stringify(record),
          winner: record.winner === 0 ? codes[0].UserId : codes[1].UserId
        }).done(function(err, result) {
          results[0] = result;
          if (!--pending) {
            next();
          }
        });
      });
    }
  });

  Result.find({ where: { user1: codes[1].UserId, user2: codes[0].UserId } }).done(function(err, result) {
    if (result) {
      results[1] = result;
      if (!--pending) {
        next();
      }
    } else {
      Game(codes[1].code, codes[0].code, function(err, record) {
        Result.create({
          user1: codes[1].UserId,
          user2: codes[0].UserId,
          record: JSON.stringify(record),
          winner: record.winner === 0 ? codes[1].UserId : codes[0].UserId
        }).done(function(err, result) {
          results[1] = result;
          if (!--pending) {
            next();
          }
        });
      });
    }
  });
}

var calc = module.exports = function(end) {
  var startTime = new Date();
  Code.findAll({ where: { type: 'publish' } }).done(function(err, codeResult) {
    console.log('Valid codes: ' + codeResult.length);
    aqsort(codeResult.map(function(item) {
      item = item.dataValues;
      item.win = item.lost = 0;
      return item;
    }), function(a, b, callback) {
      runCodes(a, b, callback);
    }, function(err, result) {
      var C = [];
      var top = result.splice(0, 30);
      var min = top.length > 20 ? 20 : top.length;
      for (var i = 0; i < min; ++i) {
        for (var j = i + 1; j < min; ++j) {
          C.push([i, j]);
        }
      }
      async.eachSeries(C, function(item, next) {
        runCodes(top[item[0]], top[item[1]], function(err, score) {
          if (typeof top[item[0]].score === 'undefined') {
            top[item[0]].score = 0;
          }
          if (typeof top[item[1]].score === 'undefined') {
            top[item[1]].score = 0;
          }
          if (score < 0) {
            top[item[0]].score += 1;
          } else {
            top[item[1]].score += 1;
          }
          next();
        }, true);
      }, function() {
        result = top.sort(function(a, b) {
          return b.score - a.score;
        }).concat(result);
        result.forEach(function(item, index) {
          item.rank = index + 1;
        });
        async.eachLimit(result, 10, function(item, next) {
          Code.update({ rank: item.rank, win: item.win, lost: item.lost }, {
            where: { UserId: item.UserId, type: 'publish' }
          }).done(next);
        }, function() {
          console.log('Done(' + round + '): ' + (new Date() - startTime));
          if (end) {
            end();
          }
        });
      });
    });
  });
};

if (require.main === module) {
  calc(function() {
    process.exit(0);
  });
}
