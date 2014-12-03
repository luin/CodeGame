var Game = require('./game/game');
var Commander = require('./game/commander');
var Movable = require('./game/movable');
var Replay = require('./game/replay');

var STAR_INTERVAL = 10;
var TOTAL_FRAMES = 128;
var TOTAL_TIME = 3000;

module.exports = function(parsedMap, code1, code2, callback) {
  var game = new Game(parsedMap, {
    AI: [code1, code2]
  });

  var replay = new Replay(game);

  function checkError() {
    var errorIndex = [];
    game.players.forEach(function(player, index) {
      if (player.error) {
        errorIndex.push(index);
      }
    });
    return errorIndex;
  }

  function handleDraw() {
    var winner, reason;
    if (game.players[0].stars !== game.players[1].stars) {
      reason = 'star';
      if (game.players[0].stars > game.players[1].stars) {
        winner = 0;
      } else {
        winner = 1;
      }
    } else {
      reason = 'runTime';
      if (game.players[0].runTime < game.players[1].runTime) {
        winner = 0;
      } else {
        winner = 1;
      }
    }
    return {
      type: 'game',
      action: 'end',
      reason: reason,
      winner: winner
    };
  }

  function update(callback) {
    game.frames += 1;

    var errorIndex = checkError();
    if (errorIndex.length === 2) {
      replay.end(handleDraw());
      callback(null, replay.clone());
      return;
    } else if (errorIndex.length === 1) {
      replay.end({
        type: 'game',
        action: 'end',
        reason: 'error',
        winner: 1 - errorIndex[0]
      });
      callback(null, replay.clone());
      return;
    }

    // Check if any tank has crashed
    var crashedIndex = [];
    game.players.forEach(function(player, index) {
      if (player.tank.crashed) {
        crashedIndex.push(index);
      }
    });

    if (crashedIndex.length === 2) {
      replay.end(handleDraw());
      callback(null, replay.clone());
      return;
    }

    if (crashedIndex.length === 1) {
      replay.end({
        type: 'game',
        action: 'end',
        reason: 'crashed',
        winner: 1 - crashedIndex[0]
      });
      callback(null, replay.clone());
      return;
    }

    // Check if time's up
    if (game.frames > TOTAL_FRAMES) {
      replay.end(handleDraw());
      callback(null, replay.clone());
      return;
    }

    // Check runtime
    if (game.players.some(function(player) { return player.runTime > TOTAL_TIME; })) {
      var winner;
      if (game.players[0].runTime > game.players[1].runTime) {
        winner = 1;
      } else {
        winner = 0;
      }
      replay.end({
        type: 'game',
        action: 'end',
        reason: 'timeout',
        value: game.players[1 - winner].runTime,
        winner: winner
      });
      callback(null, replay.clone());
      return;
    }

    // Place the star
    if (!game.star && (game.frames - game.lastCollectedStar >= STAR_INTERVAL)) {
      var middlePoint = [(game.players[0].tank.position[0] + game.players[1].tank.position[0]) / 2,
                         (game.players[0].tank.position[1] + game.players[1].tank.position[1]) / 2];

      if (middlePoint[0] % 1 === 0 && middlePoint[1] % 1 === 0 &&
          game.map[middlePoint[0]][middlePoint[1]] !== 'x') {
        game.star = middlePoint;
        replay.record({
          type: 'star',
          action: 'created',
          position: game.star
        });
      }
    }

    // Execute a command
    game.players.forEach(function(player) {
      player.tank.lastPosition = null;
      var command = player.pendingCommands.shift();
      switch (command) {
        case 'left':
        case 'right':
          player.tank.turn(command);
          replay.record({
            type: 'tank',
            action: 'turn',
            direction: command,
            objectId: player.tank.id
          });
          break;
        case 'go':
          player.tank.lastPosition = player.tank.position.slice();
          player.tank.go();
          replay.record({
            type: 'tank',
            action: 'go',
            position: player.tank.position.slice(),
            objectId: player.tank.id
          });
          break;
        case 'fire':
          if (!player.bullet) {
            player.bullet = Movable.create(player.tank);
            replay.record({
              type: 'bullet',
              action: 'created',
              tank: player.tank.clone(),
              objectId: player.bullet.id
            });
          }
          break;
      }
    });

    // Handle collision
    var collidedPlayers;
    var testCollision = function(player, index) {
      if (!player.tank.lastPosition) {
        return;
      }
      var enemyTank = game.players[1 - index].tank;
      if (game.map[player.tank.position[0]][player.tank.position[1]] === 'x') {
        collidedPlayers.push(player);
      } else if (player.tank.collided(enemyTank)) {
        collidedPlayers.push(player);
      } else if (player.tank.lastPosition && enemyTank.lastPosition) {
        // 双方坦克互相穿过的情形
        if (player.tank.collided({ position: enemyTank.lastPosition }) &&
            enemyTank.collided({ position: player.tank.lastPosition})) {
          collidedPlayers.push(player);
        }
      }
    };
    var handleCollision = function(player) {
      replay.setRecord(replay.getRecord().filter(function(r) {
        return !(r.type === 'tank' && r.action === 'go' && r.objectId === player.tank.id);
      }));
      if (player.tank.lastPosition) {
        player.tank.position = player.tank.lastPosition;
        player.commands = [];
      }
    };
    do {
      collidedPlayers = [];
      game.players.forEach(testCollision);
      collidedPlayers.forEach(handleCollision);
    } while (collidedPlayers.length);

    // Check star
    game.players.forEach(function(player, index) {
      if (game.star && player.tank.collided({ position: game.star })) {
        game.star = null;
        game.lastCollectedStar = game.frames;
        player.stars += 1;
        replay.record({
          type: 'star',
          action: 'collected',
          by: index
        });
      }
    });

    // Move bullets
    game.players.forEach(function(player, index) {
      if (!player.bullet) {
        return;
      }
      if (player.bullet.collided(game.players[1 - index].tank)) {
        replay.record({
          type: 'bullet',
          tank: player.tank,
          action: 'crashed',
          objectId: player.bullet.id
        });
        replay.record({
          type: 'tank',
          action: 'crashed',
          index: index,
          objectId: game.players[1 - index].tank.id
        });
        game.players[1 - index].tank.crashed = true;
        return;
      }
      for (var i = 0; i < 2; ++i) {
        player.bullet.go();
        replay.record({
          type: 'bullet',
          tank: player.tank,
          action: 'go',
          order: i,
          position: player.bullet.position.slice(),
          objectId: player.bullet.id
        });
        if (game.map[player.bullet.position[0]][player.bullet.position[1]] === 'x') {
          replay.record({
            type: 'bullet',
            tank: player.tank,
            action: 'crashed',
            objectId: player.bullet.id
          });
          player.bullet = null;
          break;
        } else if (player.bullet.collided(game.players[1 - index].tank)) {
          replay.record({
            type: 'bullet',
            tank: player.tank,
            action: 'crashed',
            objectId: player.bullet.id
          });
          replay.record({
            type: 'tank',
            action: 'crashed',
            index: index,
            objectId: game.players[1 - index].tank.id
          });
          game.players[1 - index].tank.crashed = true;
          break;
        }
      }
    });

    // Listen to the commander when idle
    game.players.forEach(function(player, index) {
      if (player.pendingCommands.length === 0) {
        var commander = new Commander(player.clone());
        var clonedGame = game.clone();
        var enemy = clonedGame.players[1 - index];
        delete clonedGame.players;
        // Check if the enemy's bullet is visible
        if (enemy.bullet) {
          var accessible = false;
          var distance, d;
          if (enemy.bullet.position[0] === player.tank.position[0] && (
            (enemy.bullet.position[1] > player.tank.position[1] && player.tank.direction === 'down') ||
            (enemy.bullet.position[1] < player.tank.position[1] && player.tank.direction === 'up')
          )) {
            accessible = true;
            var x = enemy.bullet.position[0];
            distance = enemy.bullet.position[1] - player.tank.position[1];
            for (d = 1; d < Math.abs(distance); ++d) {
              if (clonedGame.map[x][player.tank.position[1] + (distance > 0 ? d : -d)] === 'x') {
                accessible = false;
                break;
              }
            }
          } else if (enemy.bullet.position[1] === player.tank.position[1] && (
            (enemy.bullet.position[0] > player.tank.position[0] && player.tank.direction === 'right') ||
            (enemy.bullet.position[0] < player.tank.position[0] && player.tank.direction === 'left')
          )) {
            accessible = true;
            var y = enemy.bullet.position[1];
            distance = enemy.bullet.position[0] - player.tank.position[0];
            for (d = 1; d < Math.abs(distance); ++d) {
              if (clonedGame.map[player.tank.position[0] + (distance > 0 ? d : -d)][y] === 'x') {
                accessible = false;
                break;
              }
            }
          }
          if (!accessible) {
            enemy.bullet = null;
          }
        }
        // Check if the enemy's tank is visible
        if (clonedGame.map[enemy.tank.position[0]][enemy.tank.position[1]] === 'o') {
          enemy.tank = null;
        }
        player.onIdle(commander, enemy, clonedGame);
        player.pendingCommands  = commander.__queue;
      }
    });

    if (typeof setImmediate === 'function') {
      setImmediate(function() {
        update(callback);
      });
    } else {
      setTimeout(function() {
        update(callback);
      }, 0);
    }
  }

  update(function(err, gameReplay) {
    callback(err, gameReplay);
  });
};
