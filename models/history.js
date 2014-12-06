module.exports = function(DataTypes) {
  return [{
    host: DataTypes.INTEGER,
    challenger: DataTypes.INTEGER,
    result: { type: DataTypes.ENUM('win', 'lost') }
  }];
};
