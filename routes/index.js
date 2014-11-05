var routes = require('node-require-directory')(__dirname);
var async = require('async');
var game = require('../sandbox');

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.locals.me = null;
    if (req.session.user) {
      User.find({ where: { id: req.session.user } }).then(function(user) {
        res.locals.me = req.me = user;
        next();
      });
    } else {
      next();
    }
  });

  Object.keys(routes).forEach(function(key) {
    if (key === 'index') {
      return;
    }
    app.use('/' + key, routes[key]);
  });

  app.get('/:user', function(req, res, next) {
    User.find({ where: { login: req.params.user } }).done(function(err, user) {
      if (!user) {
        return next();
      }
      user.getCodes({ type: 'publish' }).then(function(codes) {
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
          Code.find({ where: { UserId: result.user.id, type: 'publish' } }).done(function(err, code) {
            result.code = code ? code.code : null;
            callback(null, result);
          });
        } else {
          callback(null, result);
        }
      });
    }, function(err, results) {
      if (results[0].code && results[1].code) {
        Result.find({
          where: { user1: results[0].user.id, user2: results[1].user.id }
        }).done(function(err, existedResult) {
          if (existedResult) {
            var record = JSON.parse(existedResult.record);
            record.game.players[0].name = results[0].user.name;
            record.game.players[1].name = results[1].user.name;
            res.render('vs', { record: record, results: results });
          } else {
            game(results[0].code, results[1].code, function(err, record) {
              Result.create({
                user1: results[0].user.id,
                user2: results[1].user.id,
                record: JSON.stringify(record),
                winner: results[record.winner].user.id
              }).done(function() {});
              record.game.players[0].name = results[0].user.name;
              record.game.players[1].name = results[1].user.name;
              res.render('vs', { record: record, results: results } );
            });
          }
        });
      } else {
        res.render('vs', { record: null, results: results } );
      }
    });
  });

  app.get('/', function(req, res) {
    if (req.me) {
      return res.redirect('/' + req.me.login);
    }
    res.render('index');
  });
};
