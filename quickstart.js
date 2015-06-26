var express = require('express');
var path = require('path');
var googleApi = require('googleapis');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');
var authenticate = require('./routes/authenticate');
var calendars = require('./routes/calendars');

var quickstart = express();

// view engine setup
quickstart.set('views', path.join(__dirname, 'views'));
quickstart.set('view engine', 'jade');

quickstart.use(logger('dev'));
quickstart.use(bodyParser.json());
quickstart.use(bodyParser.urlencoded({extended: false}));
quickstart.use(cookieParser());
quickstart.use(express.static(path.join(__dirname, 'public')));

// Routes

var authRouter = express.Router({mergeParams: true});

quickstart.use('/', routes);
quickstart.use('/users', users);
quickstart.use('/calendars', calendars);

quickstart.use('/authenticate', authRouter);
authRouter.use('/callback', authenticate.callback);
authRouter.use('/', authenticate.authorize);

quickstart.listen('4000', '0.0.0.0');



// error handlers

// catch 404 and forward to error handler
quickstart.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});
// development error handler
// will print stacktrace
if (quickstart.get('env') === 'development') {
    quickstart.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
quickstart.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = quickstart;


/**
 * Created by nimac on 6/25/15.
 */
