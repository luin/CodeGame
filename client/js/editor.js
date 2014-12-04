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
  if ($(this).hasClass('is-disabled')) {
    return;
  }
  $(this).addClass('is-disabled');
  if (game) {
    game.stop = true;
  }
  var code = editor.getValue();
  var enemy = $('.js-enemy').val();
  var map = $('.js-map').val();
  var _this = this;
  $.post('/code/preview', { code: code, map: map, enemy: enemy }, function(data) {
    var interval = 300 / parseFloat($('.js-speed').val(), 10);
    game = new Game(data.map, jsonpack.unpack(data.result), data.names, interval, $('#playground'));
    $('.js-playground').css({ visibility: 'visible' });
    $(_this).removeClass('is-disabled');
  }).fail(function(res, _, err) {
    if (res.responseJSON && res.responseJSON.err) {
      alert(res.responseJSON.err);
    } else {
      alert(err);
    }
    $(_this).removeClass('is-disabled');
  });
});

$('.js-publish').click(function() {
  if ($(this).hasClass('is-disabled')) {
    return;
  }
  var code = editor.getValue();
  $('.js-publish').addClass('is-disabled');
  $.post('/code', { code: code }, function(data) {
    alert('保存成功！');
  });
});

$('.js-close-playground').click(function() {
  $('.js-playground').css({ visibility: 'hidden' });
});
