var $ = require('jquery');
var Game = require('./game');
var jsonpack = require('jsonpack');
// var game = new Game(jsonpack.unpack(result), names, 300, $('#playground'));
var Map = require('./game/map');

$(function() {
  maps.forEach(function(map) {
    var mapModel = new Map(map, function() {
      $('.select-maps li').removeClass('is-selected');
      $(this).parent().addClass('is-selected');
      $('#playground').hide();
      $('p.hint').show();
      $('p.hint').html('载入地图“' + map.name + '”中...');
      var url;
      if (map.result) {
        url = '/replay/' + map.result;
      } else {
        url = '/replay?user1=' + encodeURIComponent(user1.id) + '&user2=' + encodeURIComponent(user2.id) + '&map=' + map.id;
      }
      $.get(url, function(data) {
        $('p.hint').hide();
        new Game(map.data.map, jsonpack.unpack(data), [user1.name, user2.name], 300, $('#playground'));
        $('#playground').show();
      }).fail(function(res, _, err) {
        if (res.responseJSON && res.responseJSON.err) {
          alert(res.responseJSON.err);
        } else {
          alert(err);
        }
        $('p.hint').hide();
      });
    });
    var $li = $('<li></li>');
    mapModel.render($li, 200);
    $('.js-select-map').append($li);
  });
});
