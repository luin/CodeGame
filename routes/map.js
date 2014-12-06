var app = module.exports = require('express')();

testIsAdmin = function(req,res,next) {
  if(!(req.me && req.me.isAdmin())) {
    res.end("you are not an admin");
  } else {
    next();
  }
}
app.get('/new', testIsAdmin, function(req, res) {
  res.render("map-editor");
});

app.post('/create', testIsAdmin, function(req, res) {
  console.log(req.body);
  Map.create(req.body).then(function(map) {
    res.end("created map: "+map.id);
  }).catch(function(errs) {
    res.send(400,"Invalid map");
  });

});