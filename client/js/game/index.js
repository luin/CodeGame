var $ = require('jquery');
require('jquery.transit');

$.cssEase._default = $.cssEase.linear = 'linear';

var replayParser = require('./replay');

function turn($element, direction) {
  switch (direction) {
    case 'right':
      $element.css({
        rotate: '90deg'
      });
      break;
    case 'down':
      $element.css({
        rotate: '180deg'
      });
      break;
    case 'left':
      $element.css({
        rotate: '-90deg'
      });
      break;
    case 'up':
      $element.css({
        rotate: '0deg'
      });
      break;
  }
}

var Game = module.exports = function(replay, names, interval, playground, consoleDOM) {
  if (typeof playground === 'string') {
    this.$playground = $($playground);
  } else {
    this.$playground = playground;
  }
  if (typeof consoleDOM === 'string') {
    this.$consoleDOM = $($consoleDOM);
  } else {
    this.$consoleDOM = consoleDOM;
  }
  this.originalReplay = JSON.parse(JSON.stringify(replay));
  this.game = replay.game;

  var self = this;
  this.logs = {};
  this.names = names;
  this.game.players.forEach(function(player, index) {
    if (player.logs) {
      player.logs.forEach(function(log) {
        if (!self.logs[log.frame]) {
          self.logs[log.frame] = [];
        }
        self.logs[log.frame].push({
          player: index,
          type: log.type,
          frame: log.frame,
          escaped: log.escaped,
          runTime: log.runTime,
          data: log.data
        });
      });
    }
  });
  this.replay = replayParser(replay.records);

  this.$playground.empty().addClass('playground').css({
    width: this.game.map.length * 50,
    height: this.game.map[0].length * 50 + 60
  });

  this.layout();
  this.setInterval(function() {
    self.layout();
  }, 500);

  this.frame = 0;
  this.stop = false;

  this._initMap();

  this.interval = interval;
  setTimeout(function() {
    self.play(self.interval);
  });
};

Game.prototype.setTimeout = function(func, interval) {
  var self = this;
  setTimeout(function() {
    if (!self.stop) {
      func();
    }
  }, interval);
};

Game.prototype.setInterval = function(func, interval) {
  var self = this;
  setTimeout(function() {
    if (!self.stop) {
      func();
      self.setInterval(func, interval);
    }
  }, interval);
};

Game.prototype.layout = function() {
  var parent = this.$playground.parent();
  if (!this.cacheWidth) {
    this.cacheWidth = parseInt(parent.css('paddingLeft')) +
                      parseInt(parent.css('paddingRight')) +
                      parseInt(parent.css('marginLeft')) +
                      parseInt(parent.css('marginRight'));
  }
  var parentWidth = parent.width() +this.cacheWidth;
  var scale = parentWidth / this.$playground.width();
  if (!this.scale) {
    this.scale = 1;
  }
  if (Math.abs(scale - this.scale) > 0.001) {
    this.scale = scale;
    this.$playground.css({
      transform: 'scale(' + scale + ')'
    });
  }
};

Game.prototype.print = function(log) {
  if (this.$consoleDOM) {
    var $logs = this.$consoleDOM.find('.logs');
    var data = log.data;
    $logs.append('<p><span class="log-player-' + log.player +
                 '"></span><span class="log-frame">帧数<em>' + log.frame +
                 '</em></span><span class="log-runtime">代码时间<em>' + log.runTime +
                 'ms</em></span><br /><pre>' + data + '</pre></p>');

    this.setTimeout(function() {
      $logs.scrollTop($logs[0].scrollHeight);
    }, 0);
  }
  if (typeof console[log.type] === 'function') {
    console[log.type]('[玩家:', log.player, '帧数:', log.frame, '执行时间:', log.runTime + 'ms]', log.data);
  } else {
    console.log(log);
  }
};

Game.prototype._initMap = function() {
  var x, y, i;

  // Create built-in elements
  this.$star = $('<div class="star"></div>').hide();
  this.$playground.append(this.$star);

  this.$bullets = [
    $('<div class="bullet bullet1"></div>').hide(),
    $('<div class="bullet bullet2"></div>').hide()
  ];
  this.$playground.append(this.$bullets);

  this.$crashs = [
    $('<div class="crash"></div>').hide(),
    $('<div class="crash"></div>').hide()
  ];
  this.$playground.append(this.$crashs);

  // Create elements
  var tiles = [];
  // Init map
  for (x = 0; x < this.game.map.length; ++x) {
    for (y = 0; y < this.game.map[0].length; ++y) {
      switch (this.game.map[x][y]) {
        case 'x':
          tiles.push($('<div class="stone"></div>').css({
            x: x * 50,
            y: y * 50
          }));
          break;
        case 'o':
          tiles.push($('<div class="grass"></div>').css({
            left: x * 50,
            top: y * 50
          }));
          break;
      }
    }
  }

  this.object = {};
  for (i = 0; i < this.game.players.length; ++i) {
    var player = this.game.players[i];
    var $player = $('<div class="player player' + (i + 1) + '"></div>').css({
      x: player.tank.position[0] * 50,
      y: player.tank.position[1] * 50
    });

    player.tank.player = i;
    player.tank.$element = $player;
    player.tank.$bullet = this.$bullets[i];
    this.object[player.tank.id] = player.tank;

    turn($player, player.tank.direction);
    tiles.push($player);
  }

  this.$playground.append(tiles);

  // Init status bar
  this.status = { $bar: $('<div class="status"></div>').appendTo(this.$playground) };
  var barHTML = '<div class="star-count">0</div><div class="name"></div>';
  var starBar = this.status.$bar.append('<div class="player-bar player1-bar">' + barHTML + '</div>' +
                                        '<div class="player-bar player2-bar">' + barHTML + '</div>' +
                                        '<div class="frames">0</div>');
  this.status.players = this.status.$bar.find('.player-bar').map(function() {
    return {
      $starCount: $(this).find('.star-count'),
      $name: $(this).find('.name')
    };
  }).get();

  var self = this;
  this.names.forEach(function(name, index) {
    self.status.players[index].$name.html(name);
  });
  this.status.$frames = this.status.$bar.find('.frames');

  // Init modal
  this.modal = {
    $window:
      $('<div class="window"><div class="modal"><div class="title">比赛结束</div></div></div>').appendTo(this.$playground).hide()
  };
  var $content = $('<div class="content"></div>').appendTo(this.modal.$window.children('.modal'));
  $content.append('<p class="section-title">胜利者</p>');
  this.modal.content = {};
  this.modal.content.$winnerImg = $('<p class="winner-img"></p>').appendTo($content);
  this.modal.content.$winner = $('<p></p>').appendTo($content);
  $content.append('<p class="section-title">最终胜利原因</p>');
  this.modal.content.$reason = $('<p></p>').appendTo($content);
  $('<button class="js-retry">重播</button>').appendTo($content).click(function() {
    self.stop = true;
    setTimeout(function() {
      new Game(self.originalReplay, self.names, self.interval, self.$playground, self.$consoleDOM);
    }, 100);
  });
};

Game.prototype.play = function(interval) {
  if (typeof interval !== 'undefined') {
    this.interval = interval;
  }
  console.log('> ' + this.names[0] + ' 对战 ' + this.names[1] + ' 开始');
  this._onFrame();
};

Game.prototype._onFrame = function() {
  if (this.logs[this.frame]) {
    this.logs[this.frame].forEach(this.print.bind(this));
  }
  this.status.$frames.html(++this.frame);
  var actions = this.replay.shift();
  if (!actions) {
    return;
  }
  var self = this;
  actions.forEach(function(action) {
    switch (action.type) {
      case 'tank':
        var $tank = self.object[action.objectId].$element;
        switch (action.action) {
          case 'go':
            $tank.transition({
              x: action.position[0] * 50,
              y: action.position[1] * 50
            }, self.interval * action.frame);
            break;
          case 'turn':
            switch (action.direction) {
              case 'right':
                $tank.transition({
                  rotate: '+=90deg'
                }, self.interval);
                break;
              case 'left':
                $tank.transition({
                  rotate: '-=90deg'
                }, self.interval);
                break;
            }
            break;
          case 'crashed':
            self.setTimeout(function() {
              self.$crashs[action.index].show().css({
                left: $tank.css('x'),
                top: $tank.css('y')
              }).addClass('play');
              $tank.addClass('crashed');
            }, self.interval);
            break;
        }
        break;
      case 'star':
        switch (action.action) {
          case 'created':
            self.$star.css({
              left: action.position[0] * 50,
              top: action.position[1] * 50
            }).show();
            break;
          case 'collected':
            self.$star.hide();
            var $starCount = self.status.players[action.by].$starCount;
            $starCount.html(parseInt($starCount.html(), 10) + 1);
            break;
        }
        break;
      case 'bullet':
        var $bullet = self.object[action.tank.id].$bullet;
        switch (action.action) {
          case 'created':
            $bullet.css({
              x: action.tank.position[0] * 50,
              y: action.tank.position[1] * 50
            }).removeClass('crashed').show();
            turn($bullet, action.tank.direction);
            break;
          case 'go':
            $bullet.transition({
              x: action.position[0] * 50,
              y: action.position[1] * 50
            }, self.interval * action.frame);
            break;
          case 'crashed':
            $bullet.addClass('crashed');
            break;
        }
        break;
      case 'game':
        self.modal.$window.fadeIn('fast');
        self.modal.content.$winner.html(self.names[action.winner]);
        self.modal.content.$winnerImg.addClass('winner-img' + action.winner);
        var reasonMap = {
          crashed: '命中对手',
          timeout: '对手代码超时',
          star: '吃到更多的星星',
          runTime: '代码运行时间更短',
          error: '对手代码出错'
        };
        self.modal.content.$reason.html(reasonMap[action.reason]);
        break;
    }
  });
  self.setTimeout(function() {
    self._onFrame();
  }, this.interval);
};
