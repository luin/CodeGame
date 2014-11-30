module.exports = function(DataTypes) {
  return [{
    code:     DataTypes.TEXT,
    rank:     DataTypes.INTEGER,
    win:      DataTypes.INTEGER,
    lost:     DataTypes.INTEGER,
    reason:   DataTypes.STRING
  }];
};
