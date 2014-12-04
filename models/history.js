module.exports = function(DataTypes) {
  return [{
    challenger: DataTypes.INTEGER,
    host: DataTypes.INTEGER,
    result: { type: DataTypes.ENUM('win', 'lost') }
  }];
};
