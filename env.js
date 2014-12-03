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
  game(task.mapData, task.code1, task.code2, callback);
}, 1);

var jsonpack = require('jsonpack');
var crypto = require('crypto');
var md5 = function(value) {
  return crypto.createHash('md5').update(value).digest('hex');
};

global.Game = function(mapId, code1, code2, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = null;
  }
  if (options && options.cache === false) {
    Map.find(mapId).done(function(err, map) {
      if (err) {
        return callback(err);
      }
      if (!map) {
        return callback(new Error('没有找到对应的地图'));
      }
      gameQueue.push({ mapData: map.parse(), code1: code1, code2: code2 }, callback);
    });
    return;
  }
  var code1Md5 = md5(code1);
  var code2Md5 = md5(code2);
  Result.find({ where: { MapId: mapId, code1: code1Md5, code2: code2Md5 } }).done(function(err, result) {
    if (err) {
      return callback(err);
    }
    if (result) {
      return callback(null, jsonpack.unpack(result.data), result.data, result);
    }
    Map.find(mapId).done(function(err, map) {
      if (err) {
        return callback(err);
      }
      if (!map) {
        return callback(new Error('没有找到对应的地图'));
      }
      gameQueue.push({ mapData: map.parse(), code1: code1, code2: code2 }, function(err, replay) {
        if (err) {
          return callback(err);
        }
        var packedResult = jsonpack.pack(replay);
        Result.create({
          code1: code1Md5,
          code2: code2Md5,
          data: packedResult,
          MapId: mapId
        }).done(function(err, result) {
          callback(err, replay, packedResult, result);
        });
      });
    });
  });
};
