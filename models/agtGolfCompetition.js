const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var agtGolfCompetitionSchema = new Schema({
   compName : String,
   compType : String,
   compDate : Date,
   compActive : Boolean,

});


const AgtGolfCompetition = mongoose.model('AgtGolfCourse', agtGolfCompetitionSchema)


module.exports = AgtGolfCompetition;