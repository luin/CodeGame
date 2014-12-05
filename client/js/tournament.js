var $ = window.jQuery = require('jquery');
require('./vendor/bracket.js');
$(function() {    
  if (typeof result === 'undefined') {
    return;
  }
  var bracket = {};
  bracket.teams = result.teams.map(function(round) {
    return round.map(function(user) {
      return user.name || user;
    });
  });
  bracket.results = result.results;
  $('#tournamentResult').bracket({      
    init: bracket,
    onMatchClick: function(data) {
      if (!data) {
        return;
      }
      location.href = '/tournaments/' + tournamentId + '/replays/' + data.id;
    }
  });
});
