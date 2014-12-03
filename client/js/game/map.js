var $ = require('jquery');

var Map = module.exports = function(map, callback) {
  this.id = map.id;
  this.name = map.name;
  this.data = map.data.map;
  this.callback = callback;

  this.size = {
    width: this.data.length * 50,
    height: this.data[0].length * 50
  };
};

Map.prototype.render = function($dom, width) {
  var _this = this;
  var $container = $('<div />').css({
    position: 'relative',
    width: this.size.width,
    height: this.size.height + 100
  }).click(function() {
    _this.callback.apply(this, arguments);
  });
  var $playground = $('<div class="playground" />').css(this.size).appendTo($container);
  var $name = $('<div />').html(this.name).css({
    position: 'absolute',
    bottom: 0,
    left: 0,
    color: '#fff',
    width: '100%',
    height: '100px',
    fontSize: '60px',
    lineHeight: '100px',
    textAlign: 'center'
  }).appendTo($container);
  var tiles = [];
  // Init map
  for (x = 0; x < this.data.length; ++x) {
    for (y = 0; y < this.data[0].length; ++y) {
      switch (this.data[x][y]) {
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
  $playground.append(tiles);
  var scale = width / this.size.width;
  $container.css({
    transform: 'scale(' + scale + ')',
    transformOrigin: '0 0'
  });
  $dom.append($container);
};
