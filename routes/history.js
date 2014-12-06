var async = require('async');

var app = module.exports = require('express')();

app.get('/:id', function(req, res) {
  History.find({
    where: { id: req.params.id },
    include: [{ model: Result }]
  }).then(function(history) {
    if (!history) {
      return res.status(404).json({ err: 'Not found' });
    }
    history.Result.getMap().then(function(map) {
      res.locals.map = map;
      async.map([history.host, history.challenger], function(userId, next) {
        User.find(userId).done(next);
      }, function(err, users) {
        res.locals.title = 'AI 对战录像（' + users[0].name + ' VS ' + users[1].name + '）- ' + map.name;
        res.render('history', { history: history, users: users.map(function(user) { return user.name; }) });
      });
    });
  });
});
