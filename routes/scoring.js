const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const AGTGolfLad = require('../models/agtGolfLad');
const AGTGolfCourse = require('../models/agtGolfCourse');

router.get('/', ensureAuthenticated, async function(req, res, next) {
    let golfLads = [];
    if(req.user.currentScore != null ){
        if(req.user.currentScore.complete == false){
            await AGTGolfLad.find({'currentScore.holeNumber' : req.user.currentScore.holeNumber, 'scoringGroup' : req.user.scoringGroup}, {profilePicture:0}).then(golfLadsLive => {
                golfLads = golfLadsLive;
            })
            
            let data = {"holeNumber": req.user.currentScore.holeNumber + 1, "golfLads": golfLads, "courseId" : req.user.currentScore.course._id };
            console.log("holenum: " + golfLads[0].currentScore.course.holes[req.user.currentScore.holeNumber])
            if(true){
                return res.render('uploadScores', {data});
            }
        }
    }

    AGTGolfLad.find({currentScore: null}).then(golfLads => {
        if(golfLads != undefined){            
            return res.render('chooseLadsToScore', {golfLads});
        } else{
            return res.status(404).send("Couldn't find him...");
        }
    }).catch(err => { 
        return res.status(404).send("Couldn't find him with err : " + err);
    }) 
}); 

router.post('/', ensureAuthenticated, async function(req, res, next) {
    console.log('in post choose lads to score');
    let today = new Date();
    let golfLads = [];
    let courseId = '';
    let course = null;

    
    if(today.getDate() === 11){
        console.log('Day 1');
        await AGTGolfCourse.findOne({courseName : "Old Course (Dom Pedro)"}).then(theCourse => {
            courseId = theCourse._id;
            course = theCourse;
        })
    } else if (today.getDate() === 12){
        console.log('Day 2');
        await AGTGolfCourse.findOne({courseName : "Ocean Course (Vale Do Lobo)"}).then(theCourse => {
            courseId = theCourse._id;
            course = theCourse;
        })
    } else if (today.getDate() === 13){
        console.log('Day 3');
        await AGTGolfCourse.findOne({courseName : "Royal Course (Vale Do Lobo)"}).then(theCourse => {
            courseId = theCourse._id;
            course = theCourse;
        })
    } else {
        console.log('In here as its not a day of the AGT!');
        await AGTGolfCourse.findOne({courseName : "Old Course (Dom Pedro)"}).then(theCourse => {
            courseId = theCourse._id;
            course = theCourse;
        })
    }

    let scoringGroupNumber = 0;
    let someone = null;
    while(someone == null){
        console.log('in the while loop');
        scoringGroupNumber++;
        await AGTGolfLad.findOne({'scoringGroup' : scoringGroupNumber}).then(anyAtAll => {
            if(anyAtAll == undefined){
                someone = 'foundOne';
            }
        })
    }
    
    for (let index = 0; index < 8; index++) {
        if(req.body[index] != undefined) {
            await AGTGolfLad.findById(req.body[index], {profilePicture:0}).then(golfLad => {
                golfLad.scoringGroup = scoringGroupNumber;
                golfLads.push(golfLad);
                golfLad.save();
             })
        } 
    }


    let data = {"holeNumber":1, "golfLads": golfLads, "courseId" : courseId, "course" : course };
    
    if(true){
        res.render('uploadScores', {data});
    }
});

router.post('/uploadScores', ensureAuthenticated, async function(req, res, next) {
    // let golfLads = [];

    // console.log('in upload scores');

    // if(req.user.currentScore != null ){
    //     if(req.user.currentScore.complete == false){
    //         await AGTGolfLad.find({'currentScore.holeNumber' : req.user.currentScore.holeNumber, 'scoringGroup': req.user.scoringGroup}, {profilePicture:0}).then(golfLadsLive => {
    //             golfLads = golfLadsLive;
    //         })
            
    //         let data = {"holeNumber": req.user.currentScore.holeNumber + 1, "golfLads": golfLads, "courseId" : req.user.currentScore.course._id };
    //         console.log(golfLads[0].currentScore.course.holes[req.user.currentScore.holeNumber]);
    //             req.flash(
    //             'success_msg',
    //             'You have successfully posted your scores.'
    //         );
    //         return res.render('uploadScores', {data});
    //     }
    // }

    // return res.redirect('/standings');

});



module.exports = router;
