require('../env');
var Sequelize = require('sequelize');
var game = require('../sandbox');
var async = require('async');

Code.findAll({ where: { type: 'publish' } }).done(function(err, codeResult) {
  var comb = [];
  for (var i = 0; i < codeResult.length - 1; ++i) {
    for (var j = i + 1; j < codeResult.length; ++j) {
      comb.push([i, j]);
    }
  }
  async.eachLimit(comb, 10, function(item, next) {
    var pending = 2;
    var codes = item.map(function(i) {
      return codeResult[i];
    });
    Result.count({ where: { user1: codes[0].UserId, user2: codes[1].UserId } }).done(function(err, count) {
      if (count === 0) {
        game(codes[0].code, codes[1].code, function(err, record) {
          Result.create({
            user1: codes[0].UserId,
            user2: codes[1].UserId,
            record: JSON.stringify(record),
            winner: record.winner === 0 ? codes[0].UserId : codes[1].UserId
          }).done(function() {
            if (!--pending) {
              next();
            }
          });
        });
      } else {
        if (!--pending) {
          next();
        }
      }
    });

    Result.count({ where: { user1: codes[1].UserId, user2: codes[0].UserId } }).done(function(err, count) {
      if (count === 0) {
        game(codes[1].code, codes[0].code, function(err, record) {
          Result.create({
            user1: codes[1].UserId,
            user2: codes[0].UserId,
            record: JSON.stringify(record),
            winner: record.winner === 1 ? codes[0].UserId : codes[1].UserId
          }).done(function() {
            if (!--pending) {
              next();
            }
          });
        });
      } else {
        if (!--pending) {
          next();
        }
      }
    });
  }, function(err) {
    sequelize.query('SELECT winner as user, COUNT(*) as count FROM Results GROUP BY winner ORDER BY COUNT(*) desc').done(function(err, result) {
      result.forEach(function(item, index) { item.rank = index + 1; });
      async.eachLimit(result, 10, function(item, next) {
        Code.update({ rank: item.rank, win: item.count, lost: codeResult.length - item.count - 1 }, {
          where: { UserId: item.user, type: 'publish' }
        }).done(next);
      }, function() {
        console.log('Done');
        process.exit(0);
      });
    });
  });
});
