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
    fs = require('fs'),
    path = require('path'),
    routes = {},
    router, app;

exports.name = "rest";

exports.attach = function(options) {
  app = this;

  var p = path.join(__dirname, '..', '..', 'public', 'uploads');

  path.exists(p,
    function(exists) {
      if(!exists) {
        fs.mkdir(p,
          function(err) {
            if(err) throw err;
          });
      }
    });


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

  app.router.post('/add-entry/:entryId',
    function(entryId) {

      var req = this.req,
          res = this.res;

      req.on('data',
        function(chunk) {
          console.log(chunk);
        });

      req.on('end',
        function() {
          console.log('end');
        });

      model.Entry.findById(entryId,
        function(err, doc) {
          if(err) app.log.error(err);
          if(doc) {

            /*
            function saveFile() {
              var fileName = path.join(p, req.headers['x-file-name']);
              fs.writeFile(fileName, file, 'binary',
                function(err) {
                  if(err) throw err;

                  doc.photo = path.join('/uploads', req.headers['x-file-name']);
                  doc.save();


                });
            }*/

            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end('{ "valid": true }');

          } else {

          }
        });


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
  entry.save(function() {
               res.writeHead(201, { "Content-Type": "application/json" });
               res.end('{ "entryId": "'+entry._id+'" }');
             });

}