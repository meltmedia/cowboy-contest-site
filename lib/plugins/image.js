/**
 *
 * Image Manipulation Library
 *
 * Copyright(c) 2012 Nick Crohn <nick@meltmedia.com>
 * MIT LICENSE
 *
 */

var fs = require('fs'),
    im = require('imagemagick'),
    path = require('path'),
    knox = require('knox');

exports.fixImage = function(imgPath, callback) {

  im.convert([imgPath, '-auto-orient', '-resize', '670x500', imgPath],
    function(err, metaData) {
      if(err) throw err;
      callback(path.join('/uploads', path.basename(imgPath)));
    });

};