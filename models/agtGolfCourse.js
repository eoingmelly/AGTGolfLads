const mongoose = require('mongoose');
const agtGolfCourseHole = require('../models/agtGolfCourseHole')
var Schema = mongoose.Schema;

var agtGolfCourseSchema = new Schema({
   courseName : String,
   holes : [agtGolfCourseHole.schema]
});


const AgtGolfCourse= mongoose.model('AgtGolfCourse', agtGolfCourseSchema)


module.exports = AgtGolfCourse;