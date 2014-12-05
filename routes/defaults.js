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
  res.locals.user1 = req.params.user1;
  res.locals.user2 = req.params.user2;
  User.findAll({ where: { login: [req.params.user1, req.params.user2] } }).then(function(users) {
    if (users.length !== 2) {
      res.json({ err: '用户不存在' });
    }
    var user1, user2;
    if (users[0].login === req.params.user1) {
      user1 = users[0];
      user2 = users[1];
    } else {
      user1 = users[1];
      user2 = users[0];
    }
    res.locals.user1 = { id: user1.id, name: user1.name, login: user1.login };
    res.locals.user2 = { id: user2.id, name: user2.name, login: user2.login };
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
