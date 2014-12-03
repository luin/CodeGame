var app = module.exports = require('express')();
var config = require('config');

var github = require('octonode');
var authURL = github.auth.config({
  id:     config.github.id,
  secret: config.github.secret
}).login([]);

app.get('/github', function(req, res) {
  res.redirect(authURL);
});

app.get('/github/callback', function(req, res) {
  github.auth.login(req.query.code, function(err, token) {
    var client = github.client(token);
    client.me().info(function(err, info) {
      if (err || !info) {
        return res.end(err.message);
      }
      User.findOrCreate({
        where: {
          id: info.id
        },
        defaults: {
          login:    info.login,
          name:     info.name || info.login,
          avatar:   info.avatar_url,
          github:   info.html_url,
          blog:     info.blog,
          location: info.location,
          company:  info.company,
          email:    info.email,
          bio:      info.bio
        }
      }).then(function() {
        req.session.user = info.id;
        res.redirect('/' + info.login);
      });
    });
  });
});

app.get('/logout', function(req, res) {
  req.session.destroy();
  res.redirect('/');
});
