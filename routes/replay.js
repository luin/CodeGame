var async = require('async');

var app = module.exports = require('express')();
app.get('/', function(req, res) {
  async.map([req.query.user1, req.query.user2].map(function(id) {
    return parseInt(id, 10);
  }), function(id, callback) {
    function getCode() {
      Code.find({ where: { UserId: id } }).done(function(err, code) {
        callback(null, code ? code.code : null);
      });
    }
    if (req.me && req.me.id === id) {
      return getCode();
    }
    User.find(id).then(function(user) {
      user.isInTournament().then(function(result) {
        if (result) {
          return callback(user);
        }
        getCode();
      });
    });
  }, function(err, codes) {
    if (err) {
      return res.status(400).json({ err: '用户在参与杯赛期间不能参与 PvP 对战' });
    }
    if (codes[0] && codes[1]) {
      Game(req.query.map, codes[0], codes[1], function(err, replay, packedReplay, result) {
        res.json(packedReplay);
        // Add history
        if (codes[0].UserId !== codes[1].UserId && req.me) {
          codes.forEach(function(item, index) {
            if (item.UserId === req.me.id) {
              History.create({
                challenger: item.UserId,
                host: codes[1 - index].UserId,
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

app.get('/:replayId', function(req, res) {
  Result.find(req.params.replayId).then(function(result) {
    if (!result) {
      return res.status(404).json({ err: '录像不存在' });
    }
    res.json(result.data);
  });
});
