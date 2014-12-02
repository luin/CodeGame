var app = module.exports = require('express')();
var jsonpack = require('jsonpack');

app.post('/', function(req, res) {
  var promise;
  if (req.body.enemy) {
    promise = User.find({ where: { login: req.body.enemy } }).then(function(user) {
      if (!user) {
        throw new Error('用户名不存在（用户名是对方主页网址中的标识符）');
      }
      return Code.find({ where: { UserId: user.id }}).then(function(code) {
        code = code.dataValues;
        code.name = user.name;
        return code;
      });
    });
  } else {
    promise = Promise.resolve();
  }
  promise.then(function(enemy) {
    var name = req.me.name;
    if (req.body.type === 'preview') {
      name += '（预览）';
    }
    enemy = enemy || { name: name, code: req.body.code };
    Game(req.body.code, enemy.code, { cache: false }, function(err, result) {
      res.json({ result: jsonpack.pack(result), names: [name, enemy.name] });
    });
  }).catch(function(e) {
    res.status(400).json({ err: e.message });
  });

  if (req.body.type === 'publish') {
    Code.find({ where: { UserId: req.me.id } }).then(function(code) {
      if (!code) {
        code = Code.build({ UserId: req.me.id });
      }
      code.code = req.body.code;
      code.save();
    });
  }
});

app.get('/editor', function(req, res) {
  if (!req.me) {
    return res.redirect('/account/github');
  }
  req.me.getCodes().then(function(codes) {
    res.render('editor', { code: codes.length ? codes[0].code : null });
  });
});
