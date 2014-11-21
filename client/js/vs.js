var $ = require('jquery');
var Game = require('./game');
var jsonpack = require('jsonpack');
var game = new Game(jsonpack.unpack(record), 300, $('#playground'), $('#console'));
