/**
 *
 * Voting
 *
 * Copyright(c) 2012 meltmedia <notconf@meltmedia.com>
 * MIT LICENSE
 *
 */

var twitter = require('ntwitter'),
   _ = require('underscore'),
   model = require('../model/model'),
   contestHashtag = 'notconfcontest',
   twitterKeys, app, twitter,
   linearStartTime = 250,
   exponentialStartTime = 10000,
   linearCurrentWait = linearStartTime,
   exponentialCurrentWait = exponentialStartTime;

function validateVote(data) {
  
  var possibleVotes = _.pluck(data.entities.user_mentions, 'screen_name'),
  
      voteFor = function(record) {

        var doc = {};
    
        model.Vote.findOne({voterId: record.voterId}, function(err, doc) {
          if (err) throw err;
      
          if (doc) {
            // Voter already voted so decrement old entry
            model.Entry.update({twitter: doc.votedFor}, { $inc: { votes: -1 }}, function(err, numAffected) {
              if (err) throw err;
              if (numAffected > 0) app.log.debug('VOTE: ' + doc.votedFor + ' -1');
            });
          }
      
          // Increment new entry
          model.Entry.update({twitter: record.votedFor}, { $inc: { votes: 1 }}, function(err, numAffected) {
            if (err) throw err;
            if (numAffected > 0) {
              // Upsert voters vote
              model.Vote.update({voterId: record.voterId}, record, {upsert: true}, function(err, numAffected) {
                if (err) throw err;
                if (numAffected > 0) app.log.debug('VOTE: ' + record.votedFor + ' +1');
              });
            }
          });
      
        });
  
      },
      
      validateContestant = function(username) {
        model.Entry.findOne({twitter: username}, function(err, doc) {
          if(err) throw err;
          if (doc) {
            voteFor({
              voterId: data.user.id_str,
              voterTwitter: data.user.screen_name,
              votedFor: doc.twitter
            });
          } else {
            validateNextContestant();
          }
        });
      },
      
      validateNextContestant = function() {
        if (possibleVotes.length > 0) validateContestant(possibleVotes.shift());
      };

  validateNextContestant();
}

function startStream() {
  twitter.stream('statuses/filter', {track: '#'+contestHashtag}, function(stream) {
    
    linearCurrentWait = linearStartTime;
    exponentialCurrentWait = exponentialStartTime;
    
    stream.on('data', validateVote);
    stream.on('error', restart.exponential);
    stream.on('end', restart.linear);
    stream.on('destroy', restart.immediate);
  });
}

var restart = {
  immediate: function() {
    startStream();
  },
  linear: function() {
    setTimeout(startStream, linearCurrentWait);
    linearCurrentWait = Math.min(linearCurrentWait + 250, 16000);
  },
  exponential: function() {
    setTimeout(startStream, exponentialCurrentWait);
    exponentialCurrentWait = Math.min(exponentialCurrentWait * 2, 240000);
  }
};

exports.name = "voting";

exports.attach = function(options) {
  app = this;
   
  twitterKeys = app.config.get('twitterkeys');
  twitter = new twitter(twitterKeys);
  startStream();
};



