var express = require('express');
var app = express();
var fs = require("fs");
var jsSHA = require('jssha');
var btoa = require('btoa');

var tokenGenerated = false;
var vCardFileSpecified = false;
var key='528d1575762d4abd81ddc60d334ad3e4';
var appID='5fd74c.vidyo.io';
var userName='bulbul';
var expiresInSecs=1800;
var token='';

// app.all('/', function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "X-Requested-With");
//   next();
//  });

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8010');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.get('/Generate-Token', function (req, res) {

    if (expiresInSecs !== 'undefined') {
        console.log("expiresInSecs: " + expiresInSecs);
        token=res.end( JSON.stringify(checkForVCardFileAndGenerateToken(key, appID, userName, expiresInSecs)));
    } 
    return token;
});

var server = app.listen(8081, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port)

});


function checkForVCardFileAndGenerateToken(key, appID, userName, expiresInSeconds) {
    // if (vCardFileSpecified) {
    //     fs.readFile(options.vCardFile, 'utf8', function (err, data) {
    //         if (err) {
    //             return console.log("error reading vCard file " + err);
    //         }
    //         console.log("read in the fillowing vCard: " + data);
    //         generateToken(key, appID, userName, expiresInSeconds, data);
    //     });
    // } else {
        var generatedToken=generateToken(key, appID, userName, expiresInSeconds, "");
        return generatedToken;
    // }
}

function generateToken(key, appID, userName, expiresInSeconds, vCard) {
    var EPOCH_SECONDS = 62167219200;
    var expires = Math.floor(Date.now() / 1000) + expiresInSeconds + EPOCH_SECONDS;
    var shaObj = new jsSHA("SHA-384", "TEXT");
    shaObj.setHMACKey(key, "TEXT");
    jid = userName + '@' + appID;
    var body = 'provision' + '\x00' + jid + '\x00' + expires + '\x00' + vCard;
    shaObj.update(body);
    var mac = shaObj.getHMAC("HEX");
    var serialized = body + '\0' + mac;
    console.log("\nGenerated Token: \n" + btoa(serialized));
    return btoa(serialized);
}