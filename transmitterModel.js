
var serverConfig = require('config');
// Mongoose import
var mongoose = require('mongoose');

// Mongoose connection to MongoDB (ted/ted is readonly)
var conn = mongoose.connect(serverConfig.MongodbURL + serverConfig.Database,
                           function (error) {
  if (error) {
    console.log(error);
  }
});

var Schema = mongoose.Schema;

var TransmitterSchema = new Schema({
  transmitterId: String,
  timeStamp: String,
  devicesConnected: String,
  chargeValue: String
  }, { collection: serverConfig.Collection });
  // mongoose adds 's' at the end of the collection name hence
  // we need to force what we want it to be

module.exports = mongoose.model(serverConfig.Collection, TransmitterSchema, serverConfig.Collection);

