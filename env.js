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

var jsonpack = require('jsonpack');
var crypto = require('crypto');
var md5 = function(value) {
  return crypto.createHash('md5').update(value).digest('hex');
};

global.Game = function(code1, code2, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = null;
  }
  if (options && options.cache === false) {
    return gameQueue.push({ code1: code1, code2: code2 }, callback);
  }
  var code1Md5 = md5(code1);
  var code2Md5 = md5(code2);
  Result.find({ where: { code1: code1Md5, code2: code2Md5 } }).done(function(err, result) {
    if (err) {
      return callback(err);
    }
    if (result) {
      return callback(null, jsonpack.unpack(result.data), result.data, result);
    }
    gameQueue.push({ code1: code1, code2: code2 }, function(err, replay) {
      var packedResult = jsonpack.pack(replay);
      Result.create({
        code1: code1Md5,
        code2: code2Md5,
        data: packedResult
      }).done(function(err, result) {
        callback(err, replay, packedResult, result);
      });
    });
  });
};
