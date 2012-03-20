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

                    if(req.body && req.body.hasOwnProperty('token')) {
                      app.log.debug('Found token "'+req.body.token+'", finding in records.');
                      model.Controller.findOne({ token: req.body.token.toString('utf8') },
                        function(err, doc) {
                          if(err) throw err;
                          if(doc) {
                            app.log.debug('Controller found.');
                            res.writeHead(200, { "Content-Type": "application/json" });
                            res.end('{ "valid": "'+doc.name+'"}');
                          } else {
                            app.log.debug('Controller not found.');
                            res.writeHead(403, { "Content-Type": "text/plain" });
                            res.end("Forbidden");
                          }
                      });
                    } else {
                      app.log.debug('Token missing');
                      res.writeHead(403, { "Content-Type": "text/plain" });
                      res.end("Forbidden");
                    }
                  });
};