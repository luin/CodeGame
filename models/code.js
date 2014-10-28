module.exports = function(DataTypes) {
  return [{
    code:     DataTypes.TEXT,
    type:     { type: DataTypes.ENUM('preview', 'publish') },
    rank:     DataTypes.INTEGER
  }];
};
