var async = require('async');

var app = module.exports = require('express')();
app.get('/', function(req, res) {
  var user1 = req.query.user1;
  var user2 = req.query.user2;
  var map = req.query.map;
  async.map([user1, user2], function(login, callback) {
    var result = {};
    User.find({ where: { login: login } }).done(function(err, user) {
      result.user = user;
      if (result.user) {
        Code.find({ where: { UserId: result.user.id } }).done(function(err, code) {
          result.code = code ? code.code : null;
          callback(null, result);
        });
      } else {
        callback(null, result);
      }
    });
  }, function(err, results) {
    if (results[0].code && results[1].code) {
      Game(req.query.map, results[0].code, results[1].code, function(err, replay, packedReplay, result) {
        History.create({
          user1: results[0].user.id,
          user2: results[1].user.id,
          result: replay.winner === 0 ? 'win' : 'lost'
        }).done(function(err, history) {
          history.setResult(result).done(function() {});
        });
        res.json({
          replay: packedReplay,
          names: results.map(function(item) { return item.user.name; })
        });
      });
    } else {
      res.status(400).json({ err: '用户不存在或者没有发布过代码' });
    }
  });
});
