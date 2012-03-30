/**
 *
 * Copyright(c) 2012 Nick Crohn <nick@meltmedia.com>
 * MIT LICENSE
 *
 */

var flatiron = require('flatiron'),
    path = require('path'),
    routes = require('./lib/plugins/routes'),
    rest = require('./lib/plugins/rest'),
    voting = require('./lib/plugins/voting'),
    model = require('./lib/model/model'),
    handlebarsPlugin = require('./lib/plugins/handlebars'),
    connect = require('connect'),
    expressUglify = require('express-uglify'),
    pkg = require('./package.json'),
    winston = require('winston'),
    app = flatiron.app;

app.config.file({ file: path.join(__dirname, 'config', 'config.json') });

winston.add(winston.transports.File, { filename: 'console.log' });

var port = app.config.get('port');

app.use(flatiron.plugins.http, {

  /*
   * Middleware
   */
  before: [
/*
    expressUglify.middleware({
      src: __dirname + '/public',
      logLevel: 'info',
      loggerL: app.log
    }),
*/
    connect.static(__dirname + '/public', {maxAge: 86400000}),
    connect.staticCache()
  ],

  after: [
    // Add post-response middleware here
  ],

  onError: function(err) {
    if(err) {
      this.res.writeHead(404, { "Content-Type": "text/html" });
      this.res.end(app.render('404'));
    }
  }

});



app.use(handlebarsPlugin, {
          templates: __dirname + "/templates",
          defaultLayout: 'layout',
          blockHelpers: require('./lib/blockHelpers'),
          cacheTemplates: true
        });

app.use(model, {
          dbuser: app.config.get('dbuser'),
          dbpass: app.config.get('dbpass'),
          dburi: app.config.get('dburi')
        });

app.use(rest);
app.use(routes);

app.start(port,
  function(err) {
    if(err) throw err;
    winston.info("      name :", pkg.name);
    winston.info("   version :", pkg.version);
    winston.info("started at :", Date());
    winston.info("   on port :", port);
    winston.info("   in mode :", app.env);
  });


  

app.use(voting);
