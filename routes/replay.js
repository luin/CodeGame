var async = require('async');

var app = module.exports = require('express')();
app.get('/', function(req, res) {
  async.map([req.query.user1, req.query.user2], function(login, callback) {
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
        res.json({
          replay: packedReplay,
          names: results.map(function(item) { return item.user.name; })
        });
        // Add history
        if (results[0].user.id !== results[1].user.id && req.me) {
          results.forEach(function(item, index) {
            if (item.user.id === req.me.id) {
              History.create({
                challenger: item.user.id,
                host: results[1 - index].user.id,
                result: replay.meta.result.winner === index ? 'win' : 'lost',
                ResultId: result.id
              }).done();
            }
          });
        }
      });
    } else {
      res.status(400).json({ err: '用户不存在或者没有发布过代码' });
    }
  });
});
