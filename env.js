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
  if (task.options) {
    game(task.code1, task.code2, task.options, callback);
  } else {
    game(task.code1, task.code2, callback);
  }
}, 1);

global.Game = function(code1, code2, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = null;
  }
  gameQueue.push({
    code1: code1,
    code2: code2,
    options: options
  }, callback);
};
