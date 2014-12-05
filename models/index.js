var Sequelize = require('sequelize');
var inflection = require('inflection');
var config = require('config');

var sequelize = new Sequelize(config.mysql.database,
                              config.mysql.username,
                              config.mysql.password,
                              config.mysql);

var self = module.exports = {};

var models = require('node-require-directory')(__dirname);
Object.keys(models).forEach(function(key) {
  if (key === 'index') {
    return;
  }
  var modelName = inflection.classify(key);
  var modelInstance = sequelize.import(modelName , function(sequelize, DataTypes) {
    var definition = [modelName].concat(models[key](DataTypes));
    return sequelize.define.apply(sequelize, definition);
  });
  self[modelName] = modelInstance;
});

self.User.hasMany(self.Code);
self.Code.belongsTo(self.User);
self.History.belongsTo(self.Result);
self.Result.belongsTo(self.Map);

self.Tournament.hasMany(self.Map);
self.Map.hasMany(self.Tournament);
self.Tournament.hasMany(self.User);
self.User.hasMany(self.Tournament);

self.sequelize = self.DB = sequelize;
sequelize.sync();
