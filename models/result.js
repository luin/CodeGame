module.exports = function(DataTypes) {
  return [{
    user1:    DataTypes.INTEGER,
    user2:    DataTypes.INTEGER,
    record:   { type: DataTypes.TEXT, big: true },
    winner:   DataTypes.INTEGER
  }];
};
