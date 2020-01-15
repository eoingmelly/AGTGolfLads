const mongoose = require('mongoose');
const blogEntry = require('../models/blogEntry')
var Schema = mongoose.Schema;

var blogEntrySchema = new Schema({
    author : String,
    headline : String,
    mainText : String,
    date : Date,
    pathToImage : { type: String, default: "" },
    image : {data: Buffer, contentType : String}
});

blogEntrySchema.methods.getShortDate = function () {
    const blog = this
    
    var today = "";
    var dd = blog.date.getDate();
    var mm = blog.date.getMonth() + 1; //January is 0!

    var yyyy = blog.date.getFullYear();
    if (dd < 10) {
    dd = '0' + dd;
    } 
    if (mm < 10) {
    mm = '0' + mm;
    } 
    var today = dd + '/' + mm + '/' + yyyy;

    return today;  
}


const BlogEntry = mongoose.model('BlogEntry', blogEntrySchema)


module.exports = BlogEntry;