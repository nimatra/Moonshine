var express = require('express');
var fs = require('fs');
var http = require('http');
var querystring = require('querystring');


var router = express.Router();
module.exports = router;

var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'calendar-api-app.json';


/**
 * Auth Callback - Redirects to the Calendar Page
 * @param req
 * @param res
 */
router.callback = function (req, res) {
    router.code = req.query.code;
    router.Exchange(res);
};


/**
 * Authentication call
 * @param req
 * @param res
 */
router.authorize = function (req, res) {

// Load client secrets from a local file.

    fs.readFile(__dirname + '/../client_secret.json', function processClientSecrets(err, content) {
        if (err) {
            console.log('Error loading client secret file: ' + err);
            return;
        }
        // Authorize a client with the loaded credentials, then call the
        // Google Calendar API.
        router.credentials = JSON.parse(content);

        var authParams = querystring.stringify({
            redirect_uri: router.credentials.web.redirect_uris[0],
            response_type: 'code',
            client_id: router.credentials.web.client_id,
            scope: 'profile email https://www.googleapis.com/auth/calendar.readonly',
            approval_prompt: 'force'
        });
        var authBaseUrl = router.credentials.web.auth_uri;
        var url = authBaseUrl +'?'+ authParams.toString();
        res.redirect(url);

    });
};

/**
 * Constructs the AuthUrl from client secrets
 * @returns {string}
 */
function getAuthUrl() {

    var authBaseUrl = router.credentials.web.auth_uri;
    var redirectUri = router.credentials.web.redirect_uris[0];
    var redirectUriTag = 'redirect_uri';
    params = [];
    params.push({
        key: redirectUriTag.toString(),
        value: redirectUri.toString()
    });

    var responseType = 'code';
    var responseTypeTag = 'response_type';

    params.push({
        key: responseTypeTag.toString(),
        value: responseType.toString()
    });

    var clientId = router.credentials.web.client_id;
    var clientIdTag = 'client_id';

    params.push({
        key: clientIdTag.toString(),
        value: clientId.toString()
    });

    var scope = 'https://www.googleapis.com/auth/calendar.readonly';
    var scopeTag = 'scope';

    params.push({
        key: scopeTag.toString(),
        value: scope.toString()
    });

    var approvalPrompt = 'force';
    var approvalPromptTag = 'approval_prompt';

    params.push({
        key: approvalPromptTag.toString(),
        value: approvalPrompt.toString()
    });

    var accessType = 'offline';
    var accessTypeTag = 'access_type';

    params.push({
        key: accessTypeTag.toString(),
        value: accessType.toString()
    });

    return authBaseUrl + '?' + EncodeQueryData(params);
}

router.Exchange = function (res) {

    // Authorize a client with the loaded credentials, then call the
    // Google Calendar API.

    data = querystring.stringify({
        code: router.code,
        client_id: router.credentials.web.client_id.toString(),
        client_secret: router.credentials.web.client_secret.toString(),
        redirect_uri: router.credentials.web.redirect_uris[0],
        grant_type: 'authorization_code'
    });
    options = {
        host: 'https://www.googleapis.com',
        path: 'oauth2/v3/token'+'?'+data,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };
    router.res = res;
    http.request(options, exchangeApiCallback).end();
};

/**
 *
 * @param response
 */
function exchangeApiCallback(response) {
    var str = '';

    //another chunk of data has been recieved, so append it to `str`
    response.on('data', function (chunk) {
        str += chunk;
    });

    //the whole response has been recieved, so we just print it out here
    response.on('end', function () {
        //exchanges = JSON.parse(str);
        //router.AccessToken = exchanges.access_token;
        router.res.render('callback', {title: str});

    });
}


function getExchangeParams() {

    var redirectUri = router.credentials.web.redirect_uris[0];
    var codeTag = 'code';
    var clientIdTag = 'client_id';
    var clientSecretTag = 'client_secret';
    var redirectUriTag = 'redirect_uri';
    var grantTag = 'grant_type';
    params = [];
    params.push({
        key: redirectUriTag.toString(),
        value: redirectUri.toString()
    });
    params.push({
        key: clientIdTag.toString(),
        value: router.credentials.web.client_id.toString()
    });
    params.push({
        key: codeTag.toString(),
        value: router.code.toString()
    });
    params.push({
        key: clientSecretTag.toString(),
        value: router.credentials.web.client_secret.toString()
    });
    params.push({
        key: grantTag.toString(),
        value: 'authorization_code'
    });


    return '?' + EncodeQueryData(params);
}

/**
 * Encodes the parameters to the URI friendly format
 * @return {string}
 */
function EncodeQueryData(data) {
    var ret = [];
    for (var d in data)
    {
        ret.push(data[d].key + "=" + encodeURIComponent(data[d].value));
    }
    return ret.join("&");
}

