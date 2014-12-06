var app = module.exports = require('express')();
var jsonpack = require('jsonpack');

var Promise = require('sequelize').Promise;

app.post('/preview', function(req, res) {
  if (!req.me) {
    return res.status(403).json({ err: '请先登录' });
  }
  var promise;
  if (req.body.enemy) {
    promise = User.find({ where: { login: req.body.enemy } }).then(function(user) {
      if (!user) {
        throw new Error('用户名不存在（用户名是对方主页网址中的标识符）');
      }
      return user.isInTournament().then(function(result) {
        if (result) {
          throw new Error('对方正在参与杯赛期间，无法进行对战');
        }
        return Code.find({ where: { UserId: user.id }}).then(function(code) {
          if (!code) {
            throw new Error('用户没有公开的代码');
          }
          code = code.dataValues;
          code.name = user.name;
          res.locals.enemy = code;
        });
      });
    });
  } else {
    promise = Promise.resolve();
  }
  promise.then(function() {
    return Map.find(req.body.map).then(function(map) {
      if (!map) {
        throw new Error('未找到地图');
      }
      res.locals.map = map.parse().map;
    });
  });
  promise.then(function() {
    var name = req.me.name + '（预览）';
    res.locals.enemy = res.locals.enemy || { name: name, code: req.body.code };
    Game(req.body.map, req.body.code, res.locals.enemy.code, { cache: false }, function(err, result) {
      res.json({
        result: jsonpack.pack(result),
        names: [name, res.locals.enemy.name],
        map: res.locals.map
      });
    });
  }).catch(function(e) {
    res.status(400).json({ err: e.message });
  });

});

app.post('/', function(req, res) {
  if (!req.me) {
    return res.status(403).json({ err: '请先登录' });
  }
  Code.find({ where: { UserId: req.me.id } }).then(function(code) {
    if (!code) {
      code = Code.build({ UserId: req.me.id });
    }
    code.code = req.body.code;
    code.save();
    res.json({ msg: 'Success' });
  });
});

app.get('/editor', function(req, res) {
  if (!req.me) {
    return res.redirect('/account/github');
  }
  req.me.getCodes().then(function(codes) {
    res.locals.code = codes.length ? codes[0].code : null;
    return Map.findAll({ where: { type: 'general' }, attributes: ['id', 'name'] });
  }).then(function(maps) {
    res.locals.maps = maps;
    res.render('editor');
  });
});
