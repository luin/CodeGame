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
  User.findAll({ where: { login: [req.params.user1, req.params.user2] } }).then(function(users) {
    var user1, user2;
    users.forEach(function(user) {
      if (user.login === req.params.user1) {
        user1 = user;
      }
      if (user.login === req.params.user2) {
        user2 = user;
      }
    });
    if (!user1 || !user2) {
      res.json({ err: '玩家不存在' });
    }
    res.locals.user1 = { id: user1.id, name: user1.name, login: user1.login };
    res.locals.user2 = { id: user2.id, name: user2.name, login: user2.login };
    res.locals.title = '坦克 AI 对战（' + user1.name + ' VS ' + user2.name + '）';
    Map.findAll({ where: { type: 'general' } }).then(function(maps) {
      res.locals.maps = maps.map(function(map) {
        return {
          id: map.id,
          name: map.name,
          data: map.parse()
        };
      });
      res.render('vs');
    });
  });
});

app.get('/', function(req, res) {
  if (req.me) {
    return res.redirect('/' + req.me.login);
  }
  res.render('index');
});
