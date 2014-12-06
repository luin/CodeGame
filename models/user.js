var appAdmins = require('config').admins || [];
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
      isInTournament: function() {
        return this.getTournaments().then(function(tournaments) {
          return tournaments.some(function(tournament) {
            var now = new Date();
            return tournament.start < now && tournament.end > now;
          });
        });
      },

      isAdmin: function() {
        return appAdmins.indexOf(this.login) != -1;
      }
    }
  }];
};
