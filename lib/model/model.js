var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    app, Controller, Entry;

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
                    hashtag: String,
                    twitter: String,
                    photo: String,
                    gender: String,
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