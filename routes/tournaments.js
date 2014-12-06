var app = module.exports = require('express')();
var moment = require('moment');

app.get('/', function(req, res) {
  Tournament.findAll().then(function(tournaments) {
    res.locals.tournaments = tournaments;
    res.render('tournaments/index');
  });
});

app.get('/:tournamentId', function(req, res) {
  Tournament.find({
    where: { id: req.params.tournamentId },
    include: [{ model: User }]
  }).then(function(tournament) {
    res.locals.moment = moment;
    res.locals.tournament = tournament;
    res.render('tournaments/show');
  });
});

app.post('/:tournamentId/action/join', function(req, res) {
  if (!req.me) {
    return res.status(403).json({ err: '请先登录' });
  }
  function next() {
    res.redirect('/tournaments/' + req.params.tournamentId);
  }
  Tournament.find(req.params.tournamentId).then(function(tournament) {
    tournament.hasUser(req.me).then(function(result) {
      if (result) {
        return next();
      }
      tournament.addUser(req.me).then(function() {
        next();
      });
    });
  });
});

app.post('/:tournamentId/action/leave', function(req, res) {
  if (!req.me) {
    return res.status(403).json({ err: '请先登录' });
  }
  function next() {
    res.redirect('/tournaments/' + req.params.tournamentId);
  }
  Tournament.find(req.params.tournamentId).then(function(tournament) {
    tournament.removeUser(req.me).then(function() {
      next();
    });
  });
});

app.get('/:tournamentId/replays/:id', function(req, res) {
  Tournament.find(req.params.tournamentId).then(function(tournament) {
    if (!tournament.result) {
      return res.status(400).json({ err: '比赛尚未有结果' });
    }
    if ((new Date()) < tournament.end && !(req.me && req.me.isAdmin())) {
      return res.status(400).json({ err: '比赛尚未有结果' });
    }
    var result = JSON.parse(tournament.result).results;
    var fight;
    result.every(function(round) {
      return round.every(function(subRound) {
        if (subRound[2] && subRound[2].id === parseInt(req.params.id, 10)) {
          fight = subRound[2];
          return false;
        }
        return true;
      });
    });
    if (!fight) {
      return res.status(400).json({ err: '未找到相关录像' });
    }
    res.locals.title = tournament.name + ' AI 对战录像（' + fight.users[0].name + ' VS ' + fight.users[1].name + '）';
    Map.findAll({ where: { id: fight.maps } }).then(function(maps) {
      res.locals.maps = maps.map(function(map, index) {
        return {
          id: map.id,
          name: map.name,
          data: map.parse(),
          result: fight.result[index]
        };
      });
      res.locals.user1 = fight.users[0];
      res.locals.user2 = fight.users[1];
      res.render('vs');
    });
  });
});
