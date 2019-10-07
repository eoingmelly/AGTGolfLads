const mongoose = require('mongoose');
const agtGolfCourse = require('../models/agtGolfCourse');
const agtHoleScore = require('../models/agtHoleScore');

var Schema = mongoose.Schema;

var agtGolfScoreSchema = new Schema({
   complete: {type:Boolean, default:false},
   roundNumber : Number,
   holeNumber: Number,
   stablefordTotalScore: Number,
   strokesTotalPlayed: Number,
   holesPlayed: Number,
   datePlayed: Date,
   holeScores : [agtHoleScore.schema],
   course : agtGolfCourse.schema,
   holePar : Number
});


const AgtGolfScore= mongoose.model('AgtGolfScore', agtGolfScoreSchema)


module.exports = AgtGolfScore;
