if (require.main === module) {
  require('../env');
}

var Sequelize = require('sequelize');
var async = require('async');
var aqsort = require('aqsort');

var calc = module.exports = function(end) {
  var round = 0;
  var startTime = new Date();
  Code.findAll({ where: { type: 'publish' } }).done(function(err, codeResult) {
    console.log('Valid codes: ' + codeResult.length);
    aqsort(codeResult.map(function(item) {
      item = item.dataValues;
      item.win = item.lost = 0;
      return item;
    }), function(a, b, callback) {
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
            codes[0].win += 1;
            codes[1].lost += 1;
          } else {
            points[1] += 1;
            codes[1].win += 1;
            codes[0].lost += 1;
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
    }, function(err, result) {
      var top = result.splice(0, 30).sort(function(a, b) {
        return b.win * b.win / b.lost - a.win * a.win / a.lost;
      });
      result = top.concat(result);
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
};

if (require.main === module) {
  calc(function() {
    process.exit(0);
  });
}
