var async = require('async');
var jsonpack = require('jsonpack');
var app = module.exports = require('express')();

app.get('/:user', function(req, res, next) {
  User.find({ where: { login: req.params.user } }).done(function(err, user) {
    if (!user) {
      return next();
    }
    user.getCodes().then(function(codes) {
      var code;
      if (codes.length) {
        code = codes[0];
      }
      res.render('user', { user: user, code: code });
    });
  });
});

app.get('/:user1/vs/:user2', function(req, res) {
  async.map([req.params.user1, req.params.user2], function(login, callback) {
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
      Game(results[0].code, results[1].code, function(err, replay, packedReplay, result) {
        res.locals.result = packedReplay;
        res.locals.names = results.map(function(item) { return item.user.name; });
        History.create({
          user1: results[0].user.id,
          user2: results[1].user.id,
          result: replay.winner === 0 ? 'win' : 'lost'
        }).done(function(err, history) {
          history.setResult(result).done(function() {});
        });
        res.render('vs');
      });
    } else {
      res.render('vs', { result: null } );
    }
  });
});

app.get('/', function(req, res) {
  if (req.me) {
    return res.redirect('/' + req.me.login);
  }
  res.render('index');
});
