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
    winston = require('winston'),
    model = require('../model/model'),
    fs = require('fs'),
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
        winston.debug('Found token "'+req.body.token+'", looking up in collections.');
        model.Controller.findOne({ token: req.body.token.toString('utf8') },
          function(err, doc) {
            if(err) throw err;
            if(doc) {
              winston.debug('Controller found.');
              addEntry(req, res);
            } else {
              winston.debug('Controller not found.');
              res.writeHead(403, { "Content-Type": "application/json" });
              res.end('{"message":"forbidden"}');
            }
          });
      } else {
        winston.debug('Token missing');
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
          if(err) winston.error(err);
          if(doc) {

            function saveFile() {
              var extension = '.jpg',
                  newName = doc.twitter + extension,
                  fileName = path.join(p, newName),
                  data = "";

              path.exists(fileName,
                function(exists) {
                  if(exists) {
                    winston.warn('Upload file is being overwritten.');
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
      entry, record, query,
      returnResponse = function(code, data) {
        res.writeHead(code, { "Content-Type": "application/json" });
        res.end(JSON.stringify(data));
      };

  record = {
    firstName: data.firstName,
    lastName: data.lastName,
    twitter: data.twitter
  };

  query = {
    twitter: data.twitter
  };

  model.Entry.update(query, record, {upsert: true}, function(err, numAffected) {
    if(err) throw err;
    if (numAffected === 0) {
      returnResponse(500, {valid: false});
    } else {
      model.Entry.findOne(query, function(err, doc) {
        if(err) throw err;
        if(doc) {
          returnResponse(201, {entryId: doc._id});
        } else {
          returnResponse(500, {valid: false});
        }
      });
    }
  });

}