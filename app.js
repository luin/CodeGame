require('./env');

var express = require('express');
var path = require('path');
var app = express();
var config = require('config');

app.set('port', process.env.PORT || 3000);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(require('morgan')('dev'));

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

app.use(require('cookie-parser')());

var session = require('express-session');
var RedisStore = require('connect-redis')(session);
app.use(session({
  store: new RedisStore(config.redis),
  secret: config.session.secret,
  cookie: {
    maxAge: 60000 * 60 * 24 * 14
  }
}));

app.use(function(req, res, next) {
  res.locals.config = config;
  res.locals.req = req;
  next();
});

app.use('/public', express.static(path.join(__dirname, 'public')));

require('./routes')(app);

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: err
  });
});

require('http').createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});
