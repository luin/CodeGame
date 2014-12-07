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
    codeResult = codeResult.filter(function(item) {
      return item.code.length > 700;
    });
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
      top.forEach(function(item) {
        item.win = item.lose = 0;
        item.winReasons = {};
        item.loseReasons = {};
      });
      var min = top.length > 30 ? 30 : top.length;
      for (var i = 0; i < min; ++i) {
        for (var j = i + 1; j < min; ++j) {
          C.push([i, j]);
        }
      }
      async.eachSeries(C, function(item, next) {
        runCodes(MAP_ID, top[item[0]], top[item[1]], next);
      }, function() {
        result = top.sort(function(a, b) {
          return b.win - a.win;
        }).concat(result);
        result.forEach(function(item, index) {
          item.rank = index + 1;
          item.winReason = maxReason(item.winReasons);
          item.loseReason = maxReason(item.loseReasons);
        });
        Code.update({
          rank: null,
          win: 0,
          lost: 0,
          winReason: '',
          loseReason: ''
        }, { where: {} }).done(function() {
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
    // });
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
  Map.find({ where: { type: 'rank' } }).then(function(map) {
    MAP_ID = map.id;
    calc(function() {
      process.exit(0);
    });
  });
}
