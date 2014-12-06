var $ = require('jquery');
require('jquery.transit');

var DIRECTIONS = ['up', 'right', 'down', 'left'];
var DIRECTION_TO_MAP_CODE = {
  "up": "a",
  "right": "b",
  "down": "c",
  "left": "d"
}

function playerMapCode(playerId,direction) {
  var code = DIRECTION_TO_MAP_CODE[direction];
  if(playerId == 1) {
    return code.toUpperCase();
  } else {
    return code;
  }
}

var MapEditor = module.exports = function($dom) {
  this.$dom = $dom;
};

MapEditor.toggleCycle = {
  'o': '.',
  'x': 'o',
  '.': 'x'
};

MapEditor.playerToggleCycle = {
  null: 'up',
  'up': 'right',
  'right': "down",
  "down": 'left',
  "left": null
};

// @class Tile Represents an editable tile.
//
// @prop $playground
// @prop type . | x | o
// @prop $tile DOM that displays terrain
function Tile($playground,x,y,type) {
  this.type = type;
  this.x = x;
  this.y = y;
  this.$playground = $playground;

  this.refreshTile();
}

Tile.prototype = {
  isGround: function() {
    return this.type == ".";
  },

  isPlayer: function() {
    return ['a','b','c','d','A','B','C','D'].indexOf(this.type) != -1;
  },

  clear: function() {
    this.setType('.');
  },

  setType: function(type) {
    this.type = type;
    this.refreshTile();
  },

  refreshTile: function() {
    var $tile = this.$tile;

    if($tile) {
      $tile.detach();
    }

    this.$tile = this.makeTileDom();

    if(this.$tile) {
      this.$playground.append(this.$tile)
    }
  },

  playerId: function() {
    if(~['A','B','C','D'].indexOf(this.type)) {
      return 1;
    } else if((~['a','b','c','d'].indexOf(this.type))) {
      return 0;
    } else {
      return null;
    }
  },

  playerDirection: function() {
    var i = ['a','b','c','d'].indexOf(this.type.toLowerCase());
    return DIRECTIONS[i];
  },

  setPlayer: function(playerId,direction) {
    var type = playerMapCode(playerId,direction);
    this.setType(type);
  },

  makeTileDom: function() {
    var $tile;
    var x = this.x;
    var y = this.y;
    switch(this.type) {
      case '.':
        return null;
      case 'x':
        $tile = $("<div class='stone'/>").css({
          y: y * 50,
          x: x * 50
        });
        break;
      case 'o':
        $tile = $("<div class='grass'/>").css({
          top: y * 50,
          left: x * 50
        });
        break;
      default:
        if(!this.isPlayer()) {
          return null;
        }

        $tile = $("<div class='player'/>").css({
          y: y * 50,
          x: x * 50
        });

        if(this.playerId() == 1) {
          $tile.addClass("player2");
        }

        turn($tile,this.playerDirection());

        break;
    }
    return $tile;
  }
};

MapEditor.prototype = {
  adjustSize: function(w,h) {
    this.$playground.detach();
    this.edit(MapEditor.empty(w,h));
  },

  reset: function() {
    this.adjustSize(this.w,this.h);
  },

  edit: function(mapData) {
    this.mapData = mapData;

    var w = this.w = mapData.map.length;
    var h = this.h = mapData.map[0].length;

    // nested array to track the tiles being edited.
    var map = this.map = [];

    this.$dom.css({
      height: h * 50,
      width:  w * 50
    });

    this.$playground = $("<div class='playground'/>").css({
      height: "100%", width: "100%"
    }).click(this.handleClick.bind(this));
    this.$dom.append(this.$playground);

    // track directions of player spawn points
    this.players = [null,null];

    this.render();
  },

  handleClick: function(e) {
    // translate click position to matrix coordinates.
    var pos = this.$playground.offset();
    var cx = e.pageX - pos.left;
    var cy = e.pageY - pos.top;
    var x = Math.floor(cx/50);
    var y = Math.floor(cy/50);
    if(e.metaKey) {
      this.togglePlayer(x,y);
    } else {
      this.toggleTile(x,y);
    }
  },

  // if empty ground: try to create a player.
  // if a player: rotate it.
  // else nothing
  togglePlayer: function(x,y) {
    var tile = this.map[x][y];

    if(tile.isGround()) {
      var playerId = this.players.indexOf(null);

      // Conditions to avoid creating new players.
      if(playerId == -1) {
        // Both players are placed;
        return;
      }

      var newDirection = this.players[playerId] = "up";
      tile.setPlayer(playerId,newDirection);

    } else if(tile.isPlayer()) {
      var playerId = tile.playerId();
      var direction = this.players[playerId];
      var newDirection = this.players[playerId] = MapEditor.playerToggleCycle[direction];
      if(newDirection == null) {
        // End of cycle. Remove player
        tile.clear();
      } else {
        tile.setPlayer(playerId,newDirection);
      }
    }
  },

  toggleTile: function(x,y) {
    var tile = this.map[x][y];
    if(tile.isPlayer()) {
      return;
    }
    var curTileType = tile.type;
    var nextTileType = MapEditor.toggleCycle[curTileType];
    tile.setType(nextTileType);
  },

  render: function() {
    // render tiles
    var data = this.mapData.map;
    for (var x = 0; x < data.length; x++) {
      if(!this.map[x]) {
        this.map[x] = [];
      }
      for (var y = 0; y < data[0].length; y++) {
        var tile = this.map[x][y] = new Tile(this.$playground,x,y,data[x][y]);
        if(tile.isPlayer()) {
          this.players[tile.playerId()] = tile.playerDirection();
        }
      }
    }

    var players = this.mapData.players;
    for(var i=0; i < players.length; i++) {
      var xy = players[i].position;
      var direction = this.players[i] = players[i].direction;
      var x = xy[0];
      var y = xy[1];
      var tile = this.map[x][y];
      tile.setPlayer(i,direction);
    }
  },

  // Pack the map as string.
  toMapDataString: function() {
    var lines = [];

    for (var y = 0; y < this.map[0].length; y++) {
      var line = [];
      for (var x = 0; x < this.map.length; x++) {
        var tile = this.map[x][y];
        line.push(tile.type);
      }
      lines.push(line.join(""));
    }
    return lines.join("|");
  }
};

MapEditor.empty = function (w,h) {
  var map = [];
  for(var i = 0; i < w; i++) {
    var col = [];
    map.push(col);
    for(var j = 0; j < h; j++) {
      if(i == 0 || i == w-1 || j == 0 || j == h-1) {
        col.push('x');
      } else {
        col.push('.');
      }
    }
  }
  return {
    players: [],
    map: map
  };
}

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