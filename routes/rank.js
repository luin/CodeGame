var app = module.exports = require('express')();

app.get('/', function(req, res) {
  Code.findAll({
    where: 'rank IS NOT NULL',
    limit: 100,
    order: 'rank ASC',
    include: [{ model: User, include: [{ model: Tournament }]}]
  }).done(function(err, rank) {
    res.render('rank', { rank: rank });
  });
});
