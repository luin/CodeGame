var routes = require('node-require-directory')(__dirname);
var async = require('async');
var jsonpack = require('jsonpack');

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.locals.me = null;
    if (req.session.user) {
      User.find({ where: { id: req.session.user } }).then(function(user) {
        res.locals.me = req.me = user;
        next();
      });
    } else {
      next();
    }
  });

  Object.keys(routes).forEach(function(key) {
    if (key === 'index') {
      return;
    }
    if (key === 'defaults') {
      return app.use(routes.defaults);
    }
    app.use('/' + key, routes[key]);
  });
};
