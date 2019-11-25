const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var agtGolfCompetitionSchema = new Schema({
   year : Date,
   winner : String,
   compActive : Boolean,
   country : String,
   oneDayWinners : [String],
   courseOne : String,
   courseTwo : String,
   courseThree : String,
   review : String,
   gallery : [{ data: Buffer, contentType: String }]
});


const AgtGolfCompetition = mongoose.model('AgtGolfCompetition', agtGolfCompetitionSchema)


module.exports = AgtGolfCompetition;