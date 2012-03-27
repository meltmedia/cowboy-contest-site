/**
 *
 * Voting
 *
 * Copyright(c) 2012 meltmedia <notconf@meltmedia.com>
 * MIT LICENSE
 *
 */

var twitter = require('twitter'),
   _ = require('underscore'),
   model = require('../model/model'),
   contestHashtag = 'notconfcontest',
   twitterKeys, app, twitter;

function countVote(data) {

  var hashtags = _.without(_.pluck(data.entities.hashtags, 'text'), contestHashtag);
  
  _.each(hashtags, function(hashtag) {
    
    var query = {hashtag: hashtag},
        incrementVote = { $inc: { votes: 1 }};
        
    model.Entry.update(query, incrementVote, {}, function(err, numAffected) {
      if (err) throw err;
      app.log.debug('#' + hashtag + (numAffected ? '' : ' NOT') + ' incremented');
    });
    
  });
  
}

function startStream() {
  twitter.stream('statuses/filter', {track: '#'+contestHashtag}, function(stream) {
    app.log.info('Watching Twitter for #' + contestHashtag);
    stream.on('data', countVote);
    stream.on('error', startStream);
    stream.on('end', startStream);
  });
}

exports.name = "voting";

exports.attach = function(options) {
  app = this;
   
  twitterKeys = app.config.get('twitterkeys');
  twitter = new twitter(twitterKeys);
  startStream();
};



