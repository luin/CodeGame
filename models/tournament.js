module.exports = function(DataTypes) {
  return [{
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    start: DataTypes.DATE,
    end: DataTypes.DATE,
    result: DataTypes.TEXT
  }];
};
