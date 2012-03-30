/**
 *
 * Voting
 *
 * Copyright(c) 2012 meltmedia <notconf@meltmedia.com>
 * MIT LICENSE
 *
 */

require('date-utils');

var twitter = require('ntwitter'),
   _ = require('underscore'),
   winston = require('winston'),
   model = require('../model/model'),
   linearStartTime = 250,
   exponentialStartTime = 10000,
   linearCurrentWait = linearStartTime,
   exponentialCurrentWait = exponentialStartTime,
   destroyTimeout = null,
   startTimeout = null,
   waitTimeout = null,
   superDestroyOverride = false,
   twitterKeys, app, twitter, contestHashtag, streamStart, streamEnd;
   
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
              if (numAffected > 0) {
                winston.debug('VOTE: ' + doc.votedFor + ' -1');
              } else {
                winston.warn('VOTE: could not decrement entry ' + doc.votedFor);
              }
            });
          }
      
          // Increment new entry
          model.Entry.update({twitter: record.votedFor}, { $inc: { votes: 1 }}, function(err, numAffected) {
            if (err) throw err;
            if (numAffected > 0) {
              // Upsert voters vote
              model.Vote.update({voterId: record.voterId}, record, {upsert: true}, function(err, numAffected) {
                if (err) throw err;
                if (numAffected > 0) {
                  winston.debug('VOTE: ' + record.votedFor + ' +1');
                } else {
                  winston.warn('VOTE: could not update ' + record.voterTwitter + ' vote for ' + record.votedFor);
                }
              });
            } else {
              winston.warn('VOTE: could not increment entry ' + record.votedFor);
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
        if (possibleVotes.length > 0) {
          validateContestant(possibleVotes.shift());
        } else {
          winston.debug('VOTE: No valid contestants in tweet' + data.id_str);
        }
      };
  
  validateNextContestant();
}

var streamMethods = {
  start: function() {
    twitter.stream('statuses/filter', {track: '#'+contestHashtag}, function(stream) {
      winston.debug('STREAM: starting');
      streamMethods.reset();
      streamMethods.destroyCountdown(stream);
      stream
        .on('data', validateVote)
        .on('error', function(error) {
          winston.debug('STREAM: ERROR called', error);
          streamMethods.onError(error);
        })
        .on('end', function(response) {
          winston.debug('STREAM: END called, Override ' + superDestroyOverride);
          if (!superDestroyOverride) {
            streamMethods.linear();
          }
        })
        .on('destroy', function(response) {
          winston.debug('STREAM: DESTROY called, Override ' + superDestroyOverride);
          if (!superDestroyOverride) {
            streamMethods.linear();
          }
        });
    });
  },
  startCountdown: function() {
    var now = new Date(),
        startStreamIn = null;
    
    if (now.isBefore(streamStart)) {
      startStreamIn = now.getSecondsBetween(streamStart);
    } else if ((now.equals(streamStart) || now.isAfter(streamStart)) && now.isBefore(streamEnd)) {
      startStreamIn = 0;
    }

    if (startStreamIn !== null) {
      winston.debug('STREAM: start in ' + startStreamIn + ' seconds');
      startTimeout = setTimeout(streamMethods.start, startStreamIn * 1000);
    }
  },
  destroyCountdown: function(stream) {
    var now = new Date(),
        streamDestoryIn = null;
  
    if (now.isBefore(streamEnd)) {
      streamDestoryIn = now.getSecondsBetween(streamEnd);
    } else if (now.equals(streamEnd) || now.isAfter(streamEnd)) {
      streamDestoryIn = 0;
    }
  
    if (streamDestoryIn !== null) {
      winston.debug('STREAM: destroy in ' + streamDestoryIn + ' seconds');
      destroyTimeout = setTimeout(function() {
        winston.debug('STREAM: times up, destroying');
        superDestroyOverride = true;
        stream.destroySilent();
      }, streamDestoryIn * 1000);
    }
  },
  onError: function(error) {
    if (error === 'http') {
      streamMethods.exponential();
    } else {
      streamMethods.linear();
    }
  },
  linear: function() {
    winston.debug('STREAM: applying linear wait', linearCurrentWait);
    clearTimeout(waitTimeout);
    waitTimeout = setTimeout(streamMethods.start, linearCurrentWait);
    linearCurrentWait = Math.min(linearCurrentWait + 250, 16000);
  },
  exponential: function() {
    winston.debug('STREAM: applying exponential wait', exponentialCurrentWait);
    clearTimeout(waitTimeout);
    waitTimeout = setTimeout(streamMethods.start, exponentialCurrentWait);
    exponentialCurrentWait = Math.min(exponentialCurrentWait * 2, 240000);
  },
  reset: function() {
    linearCurrentWait = linearStartTime;
    exponentialCurrentWait = exponentialStartTime;
    clearTimeout(destroyTimeout);
    clearTimeout(startTimeout);
    clearTimeout(waitTimeout);
  }
};

exports.name = "voting";

exports.attach = function(options) {
  app = this;
  
  var votingConfig = app.config.get('voting');
  streamStart = new Date(Date.parse(votingConfig.start));
  streamEnd = new Date(Date.parse(votingConfig.end));
  contestHashtag = votingConfig.hashtag;
  
  twitterKeys = app.config.get('twitterkeys');
  twitter = new twitter(twitterKeys);
  
  streamMethods.startCountdown();
};



