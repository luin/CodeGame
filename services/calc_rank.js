if (require.main === module) {
  require('../env');
}

var async = require('async');
var aqsort = require('aqsort');

var runCodes = require('./util');

var MAP_ID;

var round = 0;

var calc = module.exports = function(end) {
  var startTime = new Date();
  Code.findAll().done(function(err, codeResult) {
    console.log('Valid codes: ' + codeResult.length);
    aqsort(codeResult.map(function(item) {
      item = item.dataValues;
      item.win = item.lose = 0;
      item.winReasons = {};
      item.loseReasons = {};
      return item;
    }), function(a, b, callback) {
      round += 1;
      runCodes(MAP_ID, a, b, callback);
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
          return (b.score || 0) - (a.score || 0);
        }).concat(result);
        result.forEach(function(item, index) {
          item.rank = index + 1;
          item.winReason = maxReason(item.winReasons);
          item.loseReason = maxReason(item.loseReasons);
        });
        async.eachLimit(result, 10, function(item, next) {
          Code.update({
            rank: item.rank,
            win: item.win,
            lost: item.lose,
            winReason: item.winReason,
            loseReason: item.loseReason,
          }, {
            where: { UserId: item.UserId }
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

function maxReason(reasons) {
  var max = { n: 0, v: '' };
  Object.keys(reasons).forEach(function(reason) {
    if (reasons[reason] > max.n) {
      max.n = reasons[reason];
      max.v = reason;
    }
  });
  return max.v;
}

if (require.main === module) {
  Map.find({ type: 'rank' }).then(function(map) {
    MAP_ID = map.id;
    calc(function() {
      process.exit(0);
    });
  });
}
