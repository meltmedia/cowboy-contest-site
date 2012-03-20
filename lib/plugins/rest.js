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

  app.router.post('/add-entry', function() {
                    var req = this.req,
                        res = this.res;

                    console.log(req.body);

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
};

function addEntry(req, res) {

  var data = req.body,
      entry, record = {};

  entry = new model.Entry(data);
  entry.save();

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end('{ "valid": "true" }');

}