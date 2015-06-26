var express = require('express');
var http = require('http');
var router = express.Router();

module.exports = router;

var options = {
    host: 'https://www.googleapis.com',
    path: 'calendar/v3/users/me/calendarList?access_token='
};

/* GET home page. */
router.get('/', function (req, res, next) {
    router.listCalendars(req, res);
});

/**
 * Lists all the calendars user has
 * @param req
 * @param res
 */
router.listCalendars = function (req, res) {
    var token = req.query.accessToken;
    options.path += token;

    http.request(options, calendarApiCallback).end();
    res.render('calendars', {
        title: 'Calendar List',
        calendars: router.calendars
    });
};

/**
 * List calendar callback, calls parse when response is received
 * @param response
 */
function calendarApiCallback(response) {
    var str = '';

    //another chunk of data has been recieved, so append it to `str`
    response.on('data', function (chunk) {
        str += chunk;
    });

    //the whole response has been recieved, so we just print it out here
    response.on('end', function () {
        parseCalendarResponse(str);
    });
}
/**
 *
 * @param response
 */
function parseCalendarResponse(response) {
    router.calendars = '';
}
/**
 * Lists the next 10 events on the user's primary calendar.
 *
 * @param {googleApi.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listEvents(auth) {
    var calendar = googleApi.calendar('v3');
    calendar.events.list({
        auth: auth,
        calendarId: 'primary',
        timeMin: (new Date()).toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime'
    }, function (err, response) {
        if (err) {
            console.log('The API returned an error: ' + err);
            return;
        }
        var events = response.items;
        if (events.length == 0) {
            console.log('No upcoming events found.');
        } else {
            console.log('Upcoming 10 events:');
            for (var i = 0; i < events.length; i++) {
                var event = events[i];
                var start = event.start.dateTime || event.start.date;
                console.log('%s - %s', start, event.summary);
            }
        }
    });
}

