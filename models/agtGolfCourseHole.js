const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var agtGolfCourseHoleSchema = new Schema({
   holeNumber : Number,
   strokeIndex : Number,
   par : Number
});


const AgtGolfCourseHole = mongoose.model('AgtGolfCourseHole', agtGolfCourseHoleSchema)


module.exports = AgtGolfCourseHole;