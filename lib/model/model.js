var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    app, Controller, Entry, Vote;

exports.name = "model";

exports.attach = function(options) {
  app = this;

  mongoose.connect(options.dburi, {
                     user: options.dbuser,
                     pass: options.dbpass
                   });

};

/**
 * Entry is a user record for a participant
 */

var EntrySchema = new Schema({
                    id: ObjectId,
                    firstName: String,
                    lastName: String,
                    twitter: String,
                    photo: String,
                    votes: Number
});

exports.Entry = Entry = mongoose.model('Entry', EntrySchema);

/**
 * Controller is the record type for a registered device to add entries
 */

var ControllerSchema = new Schema({
                         id: ObjectId,
                         name: String,
                         token: String
});

exports.Controller = Controller = mongoose.model('Controller', ControllerSchema);

/**
 * Vote is the record type for a vote counted from twitter
 */

var VoteSchema = new Schema({
                         id: ObjectId,
                         voterId: String,
                         voterTwitter: String,
                         votedFor: String
});

exports.Vote = Vote = mongoose.model('Vote', VoteSchema);