module.exports = function(DataTypes) {
  return [{
    user1: DataTypes.INTEGER,
    user2: DataTypes.INTEGER,
    result: { type: DataTypes.ENUM('win', 'lost') }
  }];
};
