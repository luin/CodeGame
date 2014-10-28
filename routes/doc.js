var app = module.exports = require('express')();

app.get('/', function(req, res) {
  res.render('doc');
});
