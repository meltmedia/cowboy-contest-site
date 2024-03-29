/**
 *
 * Handlebars rendering plugin
 *
 * Copyright(c) 2012 meltmedia <notconf@meltmedia.com>
 * MIT LICENSE
 *
 */

var handlebars = require("handlebars"),
    path = require('path'),
    yaml = require('js-yaml'),
    fs = require('fs'),
    _ = require('underscore'),

    templatePath, defaultLayoutPath, app,
    cache = {};

exports.name = "handlebarsPlugin";

exports.attach = function(options) {
  app = this;
  app.handlebars = handlebars;
  app.render = renderTemplate;
  app.cacheTemplates = options.cacheTemplates || false;

  if(!options.hasOwnProperty('templates')) {
    throw new Error("Handlebars Plugin is missing a path to the template directory.");
    process.exit(1);
  }

  templatePath = options.templates;
  defaultLayoutPath = options.defaultLayout;

  // Register the helpers
  for(var key in options.blockHelpers) {
    handlebars.registerHelper(key, options.blockHelpers[key]);
  }

};

exports.init = function(done) {
  return done();
};

function getTemplate(filePath) {

  var filePath = path.join(templatePath, filePath+".hbs"),
      exists = path.existsSync(filePath);
  if(exists) {
    return fs.readFileSync(filePath, 'utf8');
  }

  return "";
}

function renderTemplate(bodyPath, layoutPath, context) {

  var layoutName = layoutPath || defaultLayoutPath,
      // Create a cacheId because the same bodyPath can call multiple layouts
      cacheId = bodyPath+"|"+layoutName;

  if(app.cacheTemplates) {
    if(cache.hasOwnProperty(bodyPath)) {
      return cache[cacheId];
    }
  }

  var layoutSrc = getTemplate(layoutName),
      layout    = handlebars.compile(layoutSrc),
      bodySrc   = getTemplate(bodyPath),
      body, ret;

  context = context || {};

  /**
   * This chunk was provided from DocPad's yaml parsing
   * https://github.com/balupton/docpad/blob/master/lib/file.coffee
   *
   * A good idea is a good idea. Thanks guys.
   */

  var match = /^\s*([\-\#][\-\#][\-\#]+) ?(\w*)\s*/.exec(bodySrc);
  if(match) {

    var seperator = match[1],
        a = match[0].length,
        b = bodySrc.indexOf("\n"+seperator,a)+1,
        c = b+3,
        head = bodySrc.substring(a, b),
        bd = bodySrc.substring(c);

    context = _.extend(context, yaml.load(head));
    bodySrc = bd;

  }

  body = handlebars.compile(bodySrc);

  var vs = new Date(app.config.get('voting:start')),
      ve = new Date(app.config.get('voting:end')),
      t = new Date(), votingOpen = false;

  if(t < ve && t > vs) {
    votingOpen = true;
  }

  var flags = {
    votingOpen: votingOpen
  };

  context = _.extend(context, flags);
  context.body = body(context);

  ret = layout(context);

  if(app.cacheTemplates) {
    cache[cacheId] = ret;
  }

  return ret;

}