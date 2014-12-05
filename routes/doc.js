var app = module.exports = require('express')();

app.get('/', function(req, res) {
  res.render('doc/rule');
});

app.get('/api', function(req, res) {
  res.render('doc/api');
});

app.get('/tournament', function(req, res) {
  res.render('doc/tournament');
});
