var mergeObject = function(obj1, obj2) {
  Object.keys(obj2).forEach(function(key) {
    obj1[key] = obj2[key];
  });
};

mergeObject(global, require('./models'));

var config = require('config');
global.$config = config;

var async = require('async');

var game = require('./sandbox');
var gameQueue = async.queue(function(task, callback) {
  game(task.code1, task.code2, callback);
}, 1);

global.Game = function(code1, code2, callback) {
  gameQueue.push({
    code1: code1,
    code2: code2
  }, callback);
};
