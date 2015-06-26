var express = require('express');
var fs = require('fs');

var router = express.Router();
module.exports = router;

var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'calendar-api-quickstart.json';


/**
 * Auth Callback - Redirects to the Calendar Page
 * @param req
 * @param res
 */
router.callback = function (req, res) {
    storeToken(req.query.code);
    res.redirect('http://localhost:4000/calendars?accessToken=' + req.query.code);
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
        var url = getAuthUrl(JSON.parse(content));
        res.redirect(url);
    });

};

/**
 * Stores token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
    try {
        fs.mkdirSync(TOKEN_DIR);
    } catch (err) {
        if (err.code != 'EEXIST') {
            throw err;
        }
    }
    fs.writeFile(TOKEN_PATH, JSON.stringify(token));
    console.log('Token stored to ' + TOKEN_PATH);
}
/**
 * Constructs the AuthUrl from client secrets
 * @param credentials
 * @returns {string}
 */
function getAuthUrl(credentials) {

    var authBaseUrl = credentials.web.auth_uri;
    var redirectUri = credentials.web.redirect_uris[0];
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

    var clientId = credentials.web.client_id;
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
    var authUrl = authBaseUrl + '?' + EncodeQueryData(params);

    return authUrl;
}

/**
 * Encodes the parameters to the URI friendly format
 * @return {string}
 */
function EncodeQueryData(data) {
    var ret = [];
    for (var d in data)
        ret.push(data[d].key + "=" + encodeURIComponent(data[d].value));
    return ret.join("&");
}

