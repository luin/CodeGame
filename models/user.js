module.exports = function(DataTypes) {
  return [{
    id:       { type: DataTypes.INTEGER, primaryKey: true },
    login:    DataTypes.STRING,
    name:     DataTypes.STRING,
    avatar:   DataTypes.STRING,
    github:   DataTypes.STRING,
    blog:     DataTypes.STRING,
    location: DataTypes.STRING,
    company:  DataTypes.STRING,
    email:    DataTypes.STRING,
    bio:      DataTypes.STRING
  }, {
    instanceMethods: {
    }
  }];
};
