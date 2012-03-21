/**
 *
 * Rest Services
 *
 * Copyright(c) 2012 Nick Crohn <nick@meltmedia.com>
 * MIT LICENSE
 *
 */

var path = require('path'),
    director = require('director'),
    model = require('../model/model'),
    routes = {},
    router, app;

exports.name = "rest";

exports.attach = function(options) {
  app = this;

  app.router.post('/add-entry',
    function() {

      var req = this.req,
          res = this.res;

      if(req.body && req.body.hasOwnProperty('token')) {
        app.log.debug('Found token "'+req.body.token+'", looking up in collections.');
        model.Controller.findOne({ token: req.body.token.toString('utf8') },
          function(err, doc) {
            if(err) throw err;
            if(doc) {
              app.log.debug('Controller found.');
              addEntry(req, res);
            } else {
              app.log.debug('Controller not found.');
              res.writeHead(403, { "Content-Type": "application/json" });
              res.end('{"message":"forbidden"}');
            }
          });
      } else {
        app.log.debug('Token missing');
        res.writeHead(403, { "Content-Type": "application/json" });
        res.end('{"message":"forbidden"}');
      }
    });

  app.router.get('/add-entry/:entryId',
    function(entryId) {

      var req = this.req,
          res = this.res;

      model.Entry.findById(entryId,
        function(err, doc) {
          if(err) app.log.error(err);
          if(doc) {
            console.log(doc.firstName);
          } else {

          }
        });

      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.end('Done');
    });

};

function addEntry(req, res) {

  var data = req.body,
      entry, record;

  record = {
    firstName: data.firstName,
    lastName: data.lastName,
    twitter: data.twitter,
    gender: data.gender
  };

  entry = new model.Entry(record);
  entry.save();

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end('{ "valid": "true" }');

}