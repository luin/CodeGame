require('../env');
var Sequelize = require('sequelize');
var game = require('../sandbox');
var async = require('async');
var aqsort = require('aqsort');

var round = 0;
Code.findAll({ where: { type: 'publish' } }).done(function(err, codeResult) {
  aqsort(codeResult, function(a, b, callback) {
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
        } else {
          points[1] += 1;
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
        game(codes[0].code, codes[1].code, function(err, record) {
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
        game(codes[1].code, codes[0].code, function(err, record) {
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
    console.log('Done(' + round + ')');
    console.log(result.map(function(r) {
      return r.UserId;
    }));
  });
});
