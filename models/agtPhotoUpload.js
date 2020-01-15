const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var agtPhotoUploadSchema = new Schema({
    caption : String,
    date : Date,
    pathToImage : String
});



const AGTPhotoUpload = mongoose.model('AGTPhotoUpload', agtPhotoUploadSchema)


module.exports = AGTPhotoUpload;