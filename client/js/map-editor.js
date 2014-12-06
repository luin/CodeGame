// @global mapData; // from template

var $ = require('jquery');
var MapEditor = require('./game/editor');

$(function() {
  var $editor = $("#map-editor");
  var size = getMapSize();

  if(mapData == null) {
    mapData = MapEditor.empty(10,10);
  }

  editor = new MapEditor($editor);
  editor.edit(mapData);

  var $controls = $("#map-editor-controls");
  $("input[name=width]").val(mapData.map.length);
  $("input[name=height]").val(mapData.map[0].length);

  $controls.find("input[name=width], input[name=height]").change(function (e) {
    resizeMapEditor();
  });

  $controls.find("input.reset").click(function() {
    editor.reset();
  });

  $("form").submit(function() {
    var mapDataString = editor.toMapDataString()
    $("form input[name=data]").val(mapDataString);
    return true;
  });

  function getMapSize() {
    var w = $("input[name=width]").val();
    var h = $("input[name=height]").val();
    return [w,h];
  }

  function resizeMapEditor() {
    var size = getMapSize();
    editor.adjustSize(size[0],size[1]);
  }
});