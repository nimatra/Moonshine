var express = require('express');
var path = require('path');
var googleApi = require('googleapis');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var authenticate = require('./routes/authenticate');
var calendars = require('./routes/calendars');

var moonshine = express();

// view engine setup
moonshine.set('views', path.join(__dirname, 'views'));
moonshine.set('view engine', 'jade');

moonshine.use(logger('dev'));
moonshine.use(bodyParser.json());
moonshine.use(bodyParser.urlencoded({extended: false}));
moonshine.use(cookieParser());
moonshine.use(express.static(path.join(__dirname, 'public')));

// Routes

var authRouter = express.Router({mergeParams: true});

moonshine.use('/', routes);
moonshine.use('/calendars', calendars);

moonshine.use('/authenticate', authRouter);
authRouter.use('/callback', authenticate.callback);
authRouter.use('/', authenticate.authorize);

moonshine.listen('4000', '0.0.0.0');



// error handlers

// catch 404 and forward to error handler
moonshine.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});
// development error handler
// will print stacktrace
if (moonshine.get('env') === 'development') {
    moonshine.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
moonshine.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = moonshine;