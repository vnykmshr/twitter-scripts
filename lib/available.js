'use strict';

var util = require('util');
var request = require('request');
var async = require('async');

var TWITTER = 'https://twitter.com/users/username_available';
var LIMIT = 20;

function check(handle, cb) {
  util.log('check: ' + handle);
  var options = {
    uri: TWITTER,
    method: 'GET',
    qs: {
      context: 'signup',
      custom: true,
      email: 'viks%40vnykmshr.com',
      full_name: 'join',
      suggest: 1,
      suggest_on_username: true,
      username: handle
    }
  };
  request(options, function (err, resp, body) {
    util.log(err || body);
    cb(err, body);
  });
}

var available = function (handles, cb) {
  if (!util.isArray(handles)) {
    handles = [handles];
  };

  async.eachLimit(handles, LIMIT, check, cb);
};

module.exports = available;

if (require.main === module) {
  (function () {
    available('vm', function (err, res) {
      console.log(err || res);
    });
  })();
}