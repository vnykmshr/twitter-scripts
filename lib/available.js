'use strict';

var util = require('util');
var request = require('request');
var async = require('async');

var TWITTER = 'https://twitter.com/users/username_available';
var LIMIT = 20;
var reservedWords = ['post', 'session', 'join', 'apps', 'auth', 'list', 'root', 'phone'];

// async queue of requests with a pool defined by LIMIT
var q = async.queue(function (task, cb) {
  util.log('check: ' + task.handle);
  var options = {
    uri: TWITTER,
    qs: {
      username: task.handle
    }
  };
  request(options, function (err, resp, body) {
    var json;
    try {
      json = JSON.parse(body);
      json.handle = task.handle;
    } catch (e) {
      util.log(e);
    }
    cb(err, json);
  });
}, LIMIT);

var available = function (handles, cb) {
    if (!util.isArray(handles)) {
      handles = [handles];
    }

    var result = {};
    var check = handles.length;

    var qcb = function (err, res) {
        if (!err && res && res.reason) {
          if (!result[res.reason]) result[res.reason] = [];
          result[res.reason].push(res.handle);
        } else {
          util.log(err || 'no valid response received, continue');
        }

        if (--check === 0) {
          cb(null, result);
        }
      };


    var i = 0;
    for (i; i < handles.length; i++) {
      var handle = handles[i];
      if (!handle || !(/^[a-zA-Z0-9_]+$/).test(handle)) {
        util.log('invalid handle: ' + handle);
        --check;
        continue;
      }
      if (handle.length < 4 || handle.length > 15) {
        util.log('invalid handle length, ignoring: ' + handle);
        --check;
        continue;
      }
      if (reservedWords.indexOf(handle) > -1) {
        util.log('reserved keyword, ignoring: ' + handle);
        --check;
        continue;
      }
      q.push({
        handle: handle
      }, qcb);
    }
  };

module.exports = available;

if (require.main === module) {
  (function () {
    process.argv.shift();
    process.argv.shift();
    available(process.argv, function (err, res) {
      console.log(err || res);
    });
  })();
}
