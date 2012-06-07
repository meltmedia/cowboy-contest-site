/**
 *
 * Routes
 *
 * Copyright(c) 2012 meltmedia <notconf@meltmedia.com>
 * MIT LICENSE
 *
 */

var path = require('path'),
    director = require('director'),
    model = require('../model/model'),
    routes = {},
    router, app;

function renderRouteTemplate(ajaxIdentifier, token1, token2) {
  var
      // Empty string will use the default layout
      layoutName = "",
      // If we dont have a first token, then we use the index template
      path1 = (typeof token1 === 'string' && token1 !== '') ? token1 : 'index',
      // Our second token is optional, but if we have one prepend a /
      path2 = (typeof token2 === 'string' && token2 !== '') ? '/' + token2 : '',
      req = this.req, res = this.res;

  model.Entry.find({},
    function(err, docs) {
      if(err) throw err;
      res.writeHead(200, {"Content-Type": "text/html"});
      res.end(app.render(path1 + path2, layoutName, {entries: docs}));
    });
}

exports.name = "routes";

exports.attach = function(options) {
  app = this;

  // Whitelist the routes that we render a template
  // Route path must match the path to the template in the templates dir
  app.router.get(/\/(_?)\/?/, renderRouteTemplate);
  app.router.get(/\/(_?)\/?(404)/, renderRouteTemplate);
};