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
    formidable = require('formidable'),
    imgUtil = require('./image'),
    routes = {},
    router, app, count = 0;

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

      model.Entry.findById(entryId,
        function(err, doc) {
          if(err) app.log.error(err);
          if(doc) {

            function saveFile() {
              var extension = '.jpg',
                  newName = doc.twitter + extension,
                  fileName = path.join(p, newName),
                  data = "";

              path.exists(fileName,
                function(exists) {
                  if(exists) {
                    app.log.warn('Upload file is being overwritten.');
                  }
                });

              var form = formidable.IncomingForm();
              form.uploadDir = p;
              form.keepExtensions = true;

              form.parse(req,
                function(err, fields, files) {
                  if(err) throw err;

                  imgUtil.fixImage(files.file.path,
                    function(dstPath) {
                      doc.photo = dstPath;
                      doc.save();
                    });

                  res.writeHead(200, {'Content-Type': 'application/json'});
                  res.end('{ "valid": true }');

              });

              for(var i=0;i<req.chunks.length;i++) {
                req.emit('data', req.chunks[i]);
              }
            }

            saveFile();

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

  model.Entry.find({twitter: data.twitter},
    function(err, docs) {
      if(err) throw err;
      if(docs && docs.length === 0) {
        entry = new model.Entry(record);
        entry.save(
          function() {
            res.writeHead(201, { "Content-Type": "application/json" });
            res.end('{ "entryId": "'+entry._id+'" }');
          });
      } else {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end('{ "valid": false }');
      }
    });



}