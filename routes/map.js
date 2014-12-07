var app = module.exports = require('express')();

testIsAdmin = function(req,res,next) {
  if(!(req.me && req.me.isAdmin())) {
    res.end("you are not an admin");
  } else {
    next();
  }
}


app.get('/', testIsAdmin, function(req, res) {
  Map.findAll().then(function(maps) {
    res.locals.maps = maps;
    res.render("map/index");
  });
});

app.get('/:id/edit', testIsAdmin, function(req, res) {
  Map.find(req.params.id).then(function(map) {
    res.locals.map =  map.data && map.parse();
    res.locals.mapId = req.params.id;
    res.render("map/edit");
  }).catch(function(err) {
    console.error(err);
    res.send(404);
  });
});

app.post('/create', testIsAdmin, function(req, res) {
  Map.create(req.body).then(function(map) {
    res.redirect("/map/"+map.id+"/edit");
  }).catch(function(errs) {
    res.send(400,"Invalid map");
  });

});

app.post('/update', testIsAdmin, function(req, res) {
  Map.find(req.body.id).then(function(map) {
    map.data = req.body.data;
    return map.save();
  }).then(function() {
    res.redirect("/map/"+req.body.id+"/edit");
  }).catch(function(err) {
    console.log(err);
    throw err;
  });
});