var CodeMirror = require('codemirror');
require('../../node_modules/codemirror/mode/javascript/javascript.js');
require('../../node_modules/codemirror/addon/edit/closebrackets.js');
require('../../node_modules/codemirror/addon/edit/matchbrackets.js');
require('../../node_modules/codemirror/addon/selection/active-line.js');
require('../../node_modules/codemirror/addon/lint/lint.js');
require('../../node_modules/codemirror/addon/lint/javascript-lint.js');
var jshint = require('jshint');
var jsonpack = require('jsonpack');

var $ = require('jquery');

var template = require('./editor/template');

var editor = CodeMirror(document.getElementById('editor'), {
  value: (typeof existedCode !== 'string') ? template : existedCode,
  mode: 'javascript',
  theme: 'ambiance',
  lineNumbers: true,
  lint: {
    options: {
      asi: true,
      undef: true,
      browser: false,
      globals: ['debug']
    }
  },
  styleActiveLine: true,
  gutters: ['CodeMirror-lint-markers'],
  autoCloseBrackets: true,
  matchBrackets: true
});

editor.on('change', function() {
  $('.js-publish').removeClass('is-disabled');
});

window.onbeforeunload = confirmExit;

function confirmExit() {
  if (!$('.js-publish').hasClass('is-disabled')) {
    return '对代码的修改还没有保存，是否要离开该页面？';
  }
}

var Game = require('./game');
var game;
$('.js-preview').click(function() {
  if (game) {
    game.stop = true;
  }
  var code = editor.getValue();
  $.post('/code', { code: code, type: 'preview' }, function(data) {
    game = new Game(jsonpack.unpack(data.packed), 300, $('#playground'), $('#console'));
    autoLayout();
  });
});

$('.js-publish').click(function() {
  if ($(this).hasClass('is-disabled')) {
    return;
  }
  var code = editor.getValue();
  $('.js-publish').addClass('is-disabled');
  $.post('/code', { code: code, type: 'publish' }, function(data) {
    alert('保存成功！');
  });
});

var sizePercent = 0.5;

var handleSize = 10;
function autoLayout() {
  var result = false;
  var width = $(window).width() - handleSize;
  var height = $('.grid').height();

  var leftWidth = width * sizePercent | 0;
  var rightWidth = width - leftWidth;

  if (rightWidth < 360) {
    rightWidth = 360;
    leftWidth = width - rightWidth;
    sizePercent = leftWidth / width;
    result = true;
  }

  var $playground = $('#playground');
  var playgroundSize = {
    width: $playground.width(),
    height: $playground.height()
  };

  playgroundHeight = rightWidth / playgroundSize.width * playgroundSize.height;
  if (height - playgroundHeight  < 100) {
    playgroundHeight = height - 100;
    rightWidth = (playgroundHeight / playgroundSize.height * playgroundSize.width) | 0;
    leftWidth = width - rightWidth;
    sizePercent = leftWidth / width;
    result = true;
  }

  $('.item-left').width(leftWidth);
  $('.item-right').width(rightWidth);

  $('.handler').height(height);
  $('#editor').height(height);

  var bottomHeight = height - playgroundHeight;
  $('.item-top').height(playgroundHeight);
  $('.item-bottom').height(bottomHeight);

  return result;
}

$(window).resize(autoLayout);
autoLayout();

var draggingStart = null;
$(document).mousemove(function(e) {
  if (draggingStart) {
    var diff = e.pageX - draggingStart[0];
    var leftWidth = draggingStart[1] + diff;
    sizePercent = leftWidth / ($(window).width() - handleSize);
    autoLayout();
  }
});

$('.handler').mousedown(function (e) {
  $('.grid').addClass('is-dragging');
  draggingStart = [e.pageX, $('.item-left').width()];
});

$(document).mouseup(function (e) {
  $('.grid').removeClass('is-dragging');
  draggingStart = null;
});
