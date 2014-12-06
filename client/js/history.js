var $ = require('jquery');
var Game = require('./game');
var jsonpack = require('jsonpack');

$(function() {
  new Game(map, jsonpack.unpack(result), users, 300, $('#playground'));
});
