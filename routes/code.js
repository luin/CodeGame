var app = module.exports = require('express')();
var game = require('../sandbox');
var Sequelize = require('sequelize');

app.post('/', function(req, res) {
  var type = req.body.type || 'publish';
  var enemyId = req.body.enemy, enemyName, enemyCode;
  if (enemyId) {
    User.find({ where: { id: enemyId } }).then(function(enemy) {
      if (!enemy) {
        return res.status(404).json({ error: 'no user' });
      }
      var name = enemy.name;
      user.getCodes({ where: { type: 'publish' } }).then(function(codes) {
        if (codes.length === 0) {
          return res.status(404).json({ error: 'no code' });
        }
        enemyCode = codes[0];
        saveCode();
      });
    });
  } else {
    saveCode();
  }
  function saveCode() {
    req.me.getCodes({ where: { type: type } }).then(function(codes) {
      var code;
      if (codes.length) {
        code = codes[0];
        code.code = req.body.code;
        code.save().then(afterSavingCode);
      } else {
        code = Code.create({
          code: req.body.code,
          type: type
        }).then(function(code) {
          req.me.addCode(code).then(afterSavingCode);
        });
      }
    });
  }

  function afterSavingCode() {
    // Clear cache
    if (type === 'publish') {
      Result.destroy({
        where: Sequelize.or({ user1: req.me.id }, { user2: req.me.id })
      }).done(function() {});
    }
    if (!enemyCode) {
      enemyCode = req.body.code;
    }
    game(req.body.code, enemyCode, function(err, record) {
      var name = req.me.name;
      if (type === 'preview') {
        name += '（预览）';
      }
      record.game.players[0].name = name;
      record.game.players[1].name = enemyName || name;
      res.json(record);
    });
  }
});

app.get('/editor', function(req, res) {
  if (!req.me) {
    return res.redirect('/account/github');
  }
  req.me.getCodes({ where: { type: 'publish' } }).then(function(codes) {
    res.render('editor', {
      user: req.me,
      code: codes.length ? codes[0].code : null
    });
  });
});
