var app = module.exports = require('express')();

app.get('/', function(req, res) {
  Code.findAll({
    where: 'type = "publish" AND rank IS NOT NULL',
    limit: 200,
    order: 'rank ASC',
    include: [{ model: User }]
  }).done(function(err, rank) {
    res.render('rank', { rank: rank });
  });
});
