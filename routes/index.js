const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const AGTGolfLad = require('../models/agtGolfLad');
const BlogEntry = require('../models/blogEntry');
const PhotoUpload = require('../models/agtPhotoUpload');
const mongooseRandom = require('mongoose-query-random');

// Force Login Page
router.get('/', forwardAuthenticated, (req, res) => res.render('login'));

//Landing page once logged in and no comps on...
router.get('/welcome', ensureAuthenticated, async function(req,res) {
    res.locals.user = req.user;

    let data = {
        golfLads : null,
        blogEntries : null,
        photoUploads : null
    };

    await AGTGolfLad.find({}).then(lads => {
        if(lads != undefined){
            data.golfLads = lads;
        } else {
            return res.status(404).send("Couldn't find the lads");
        }
    }).catch(err => {
        return res.status(404).send("Couldn't find lads with err : " + err);
    });

    await BlogEntry.find({}).sort({'date': '-1'}).limit(3).then(entries => {
        if(entries != undefined) {
            data.blogEntries = entries;
        }
    }).catch(err => {
        return res.status(404).send("Couldn't find blog entries with err : " + err);
    });

    await PhotoUpload.find({}).limit(4).then(photos => {
        if(photos != undefined){
            data.photoUploads = photos;
        }
    }).catch(err =>  {
        return res.status(404).send("Couldn't find Photo Uploads with err : " + err);
    })
    console.log('data : ' + data);
    return res.render('welcome', {data: data});
});


module.exports = router; 
