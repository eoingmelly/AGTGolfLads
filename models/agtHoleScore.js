const mongoose = require('mongoose');

var Schema = mongoose.Schema;

var agtHoleScoreSchema = new Schema({
   golfLadName : String,
   holeNumber : Number,
   stableFordScore : {type: Number, default: 0},
   strokesScore : {type: Number, default : 0},
   holePar : Number
});


const AgtHoleScore = mongoose.model('AgtHoleScore', agtHoleScoreSchema)


module.exports = AgtHoleScore;