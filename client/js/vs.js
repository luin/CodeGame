var $ = require('jquery');
var Game = require('./game');
var jsonpack = require('jsonpack');
var game = new Game(jsonpack.unpack(result), names, 300, $('#playground'));
