const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var agtCompetitionHistorySchema = new Schema({
    agtAttendances : Number,
    longestDriveCourseWins : [String],
    nearestThePinCourseWins : [String],
    magicMikeWins : [String],
    magicMikeWinCount : Number,
    miniMikeWins : [String],
    miniMikeWinCount : Number,
    oneDayWinCount : Number
});


const AgtCompetitionHistory = mongoose.model('AgtCompetitionHistory', agtCompetitionHistorySchema)


module.exports = AgtCompetitionHistory;