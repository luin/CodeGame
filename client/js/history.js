var $ = require('jquery');
var Game = require('./game');
var jsonpack = require('jsonpack');

$(function() {
  var url = location.href;
  var title = document.title;
  $('.js-weibo').attr('href', 'http://v.t.sina.com.cn/share/share.php?url=' + encodeURIComponent(url) + '&title=' + encodeURIComponent(title));
  $('.js-twitter').attr('href', 'http://twitter.com/home/?status=' + encodeURIComponent(title) + '：' + url);
  new Game(map, jsonpack.unpack(result), users, 300, $('#playground'));
});
