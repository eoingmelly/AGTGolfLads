const express = require('express');
const router = express.Router();
const AGTGolfLad = require('../models/agtGolfLad');
const AGTGolfCourse = require('../models/agtGolfCourse');
const AGTGolfCourseHole = require('../models/agtGolfCourseHole');
const AgtGolfScore = require('../models/agtGolfScore');
const AgtHoleScore = require('../models/agtHoleScore');
const BlogEntry = require('../models/blogEntry');
const mongoose = require('mongoose');
var fs = require('fs');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const compHist = require('../models/agtCompetitionHistory');
const  blobClient  = require('@azure/storage-blob');
const AGTPhotoUpload = require('../models/agtPhotoUpload');



//MULTER
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, __dirname + '\\..\\uploads')      //you tell where to upload the files
    },
    filename: function (req, file, cb) {
        let fileType = file.originalname.substring( file.originalname.lastIndexOf('.'));
        cb(null, file.fieldname + '-' + Date.now() + fileType);
    }
  })
  
  var upload = multer({storage: storage,
    onFileUploadStart: function (file) {
      console.log(file.originalname + ' is starting ...')
    }
  });
  
  router.post('/blogEntry', upload.single('picture'), async (req, res) => {
    let imgPath = req.file.path;

    let fileName = req.body.headline.replace(/ /g, '_') + imgPath.substring(imgPath.lastIndexOf('.'));
    console.log('fn is ' + fileName);
    var be = new BlogEntry({
        author : req.body.author,
        headline : req.body.headline,
        mainText : req.body.mainText,
        date : Date.now(),
        pathToImage : fileName
    });

    const blobServiceClient = await blobClient.BlobServiceClient.fromConnectionString(process.env.CONNECT_STR);
    
    console.log('blobServiceClient is : ' +  blobServiceClient)
    console.log('imagepath is : ' + be.pathToImage);
    let containerName = "agtgolflads/blogentries";
    const containerClient = await blobServiceClient.getContainerClient(containerName);
    
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);

    let data = fs.readFileSync(imgPath);

    await blockBlobClient.upload(data, data.length).then(
        be.save().then(entry => {
            return res.status(200).json(entry);
        }).catch(err => {
            return res.status(400).json(err);
        })
    ).catch(err => {
        return res.status(400).json(err);
    })
})

router.post('/sitePhoto', upload.single('picture'), async (req, res) => {
//console.log('file.path is:' + req.file.path)
console.log('file is:' + req.file)

    let imgPath = req.file.path;
    let fileName = req.body.caption.replace(/ /g, '_') + imgPath.substring(imgPath.lastIndexOf('.'));
    var photoUpload = new AGTPhotoUpload({
        caption : req.body.caption,
        pathToImage : fileName,
        date : Date.now()
    });

    const blobServiceClient = await blobClient.BlobServiceClient.fromConnectionString(process.env.CONNECT_STR);
    
    let containerName = "agtgolflads/photouploads";
    const containerClient = await blobServiceClient.getContainerClient(containerName);
    
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);

    let data = fs.readFileSync(imgPath);

    await blockBlobClient.upload(data, data.length).then( 
        photoUpload.save().then().catch(err => {
            return res.status(400).json(err);
        })
    ).catch(err => {
        return res.status(400).json(err);
    });
    return res.status(200).json("Successfully Uploaded");
})

router.get('/anyGalleryPhoto', async (req,res) => {
    let random = 0;
    AGTPhotoUpload.countDocuments((err,num) => {
        random = Math.floor(Math.random() * num);
        console.log('random is ' + random);
    });
    
    AGTPhotoUpload.findOne().skip(random).then((result) => {
        let path = {'imagePath' : result.pathToImage};
        return res.status(200).json(path);
    })
    
});

//TEST...
  router.put('/agtGolfLadImg/:id', upload.single('profilePicture'), async (req, res) => {
    AGTGolfLad.findOne({_id : req.params.id}).then(lad => {
        if(lad != undefined){
            let imgPath = req.file.path;
            lad.profilePicture.data = fs.readFileSync(imgPath);
            lad.profilePicture.contentType = req.file.mimetype;
            lad.save();
            return res.status(200).json(lad);
        } else {
            return res.status(404).json('No lad found with id ' + req.params.id);
        }
    }).catch(err =>{
        return res.status(400).json(err);
    })

           
    //return res.status(200).json(req.file);
})

//All of the routes for users should pass in here first.... Logging/Permissions etc can be handled here.
router.all('/agtGolfLads?', function (req, res, next) {
    console.log('Every request to users should get in here first.')
    next() // pass control to the next handler
  })

router.post('/agtGolfLad', async (req,res) => {
    try{
        if(await AGTGolfLad.UsernameExists(req.body.username)){
            res.status(403).send('A user already exists with this username/email');
        }
        else 
        {
            let newestUser = new AGTGolfLad({
                password : req.body.password,
                active: true,
                handicap: req.body.handicap,
                currentScore : null,
                odds: req.body.odds,
                username : req.body.username, 
                displayName: req.body.displayname
            });
 
            newestUser.save().then(newUser => {
                res.status(200).send(newUser);
            }).catch(err => {
                console.log(err)
                res.status(500).send();
            });
        }  
    } catch (e) {
        console.log(e);
        res.status(400).send()   
    }
})

//return all lads.
router.get('/agtGolfLads', async (req, res) => {
    AGTGolfLad.find({}, {profilePicture : 0}).then(async lads => {
        if(lads.length > 0){
            for (let index = 0; index < lads.length; index++) {
                const element = lads[index];
            }
            return res.status(200).json(lads);
        } else {
            return res.status(404).json('No lads found');
        }
    }).catch(err =>{
        return res.status(400).json(err);
    })
})

//Return all current scores
router.get('/agtGolfLads/currentScores', async (req, res) => {
    let resultString = [];
    
    AGTGolfLad.find({}).then(async lads => {
        if(lads.length > 0){
            for (let index = 0; index < lads.length; index++) {
                const element = await lads[index].getCurrentRoundScore();
                resultString.push(element);
            }
            resultString = resultString.sort((a, b) => (a.StablefordPoints < b.StablefordPoints) ? 1 : -1)
            let lastPoints = -1;
            let lastPosition = 1;
            for (let indx = 0; indx < resultString.length; indx++) {
                const element = resultString[indx];
                // console.log(JSON.stringify(element));
                // console.log('lastPoints = ' + lastPoints);
                // console.log('stablefordpoints = ' + element.StablefordPoints);

                if(indx == 0){
                    element.Position = indx + 1;
                }
                else{
                    element.Position = lastPoints == element.StablefordPoints ? lastPosition : (indx + 1);    
                }

                lastPoints = element.StablefordPoints;
                lastPosition = element.Position;

            }

            return res.status(200).json(resultString);

        } else {
            return res.status(404).json('No lads found');
        }
    }).catch(err =>{
        return res.status(400).json(err);
    })
})

router.get('/agtGolfLads/championshipSunday', async (req, res) => {
    let resultString = [];
    
    console.log('in champ sunday mode');
    AGTGolfLad.find({}).then(async lads => {
        if(lads.length > 0){
            for (let index = 0; index < lads.length; index++) {
                const element = await lads[index].getChampionshipSundayScore();
                resultString.push(element);
            }
            resultString = resultString.sort((a, b) => (a.TotalPoints < b.TotalPoints) ? 1 : -1)
            
            let lastPoints = -1;
            let lastPosition = 1;
            for (let indx = 0; indx < resultString.length; indx++) {
                const element = resultString[indx];
                console.log('totalpoints:'  + resultString[indx].TotalPoints)
                if(indx == 0){
                    element.Position = indx + 1;
                }
                else{
                    element.Position = lastPoints == element.TotalPoints ? lastPosition : (indx + 1);    
                }

                lastPoints = element.TotalPoints;
                lastPosition = element.Position;

            }

            return res.status(200).json(resultString);

        } else {
            return res.status(404).json('No lads found');
        }
    }).catch(err =>{
        return res.status(400).json(err);
    })
})

//Return all current scores
router.get('/agtGolfLads/leagueScores', async (req, res) => {
    let results= [];
    let resultString = [];
    AGTGolfLad.find({}).then(async lads => {
        if(lads.length > 0){
            for (let index = 0; index < lads.length; index++) {
                const element = await lads[index].getLeagueScore();
                resultString.push(element);
            }

            console.log('resString is:' + resultString);
            resultString = resultString.sort((a, b) => (a.StablefordPoints < b.StablefordPoints) ? 1 : -1)
            let lastPoints = -1;
            let lastPosition = 1;
            for (let indx = 0; indx < resultString.length; indx++) {
                const element = resultString[indx];
                if(indx == 0){
                    element.Position = indx + 1;
                }
                else{
                    element.Position = lastPoints == element.StablefordPoints ? lastPosition : (indx + 1);    
                }

                lastPoints = element.StablefordPoints;
                lastPosition = element.Position;
            }

            return res.status(200).json(resultString);
        } else {
            return res.status(404).json('No lads found');
        }
        return res.status(200).json(results);
    }).catch(err =>{
        return res.status(400).json(err);
    })
})

router.get('/agtGolfLads/parThreeScores', async (req, res) => {
    let results= [];
    let resultString = [];
    AGTGolfLad.find({}).then(async lads => {
        if(lads.length > 0){
            for (let index = 0; index < lads.length; index++) {
                const element = await lads[index].getParThreeScore();
                resultString.push(element);
            }

             resultString = resultString.sort((a, b) => (a.StrokesPlayed > b.StrokesPlayed) ? 1 : -1)
            
             let lastPoints = -1;
            let lastPosition = 1;
            for (let indx = 0; indx < resultString.length; indx++) {
                const element = resultString[indx];
                
                if(indx == 0){
                    element.Position = indx + 1;
                }
                else{
                    element.Position = lastPoints == element.StrokesPlayed ? lastPosition : (indx + 1);    
                }

                lastPoints = element.StrokesPlayed;
                lastPosition = element.Position;
            }

            return res.status(200).json(resultString);
        } else {
            return res.status(404).json('No lads found');
        }
        return res.status(200).json(results);
    }).catch(err =>{
        return res.status(400).json(err);
    })
})
//Get rid of all of this nonsense.
router.get('/agtGolfLads/finaliseLeagueTable', async (req, res) => {

    let results= [];
    let resultString = [];
    AGTGolfLad.find({}).then(async lads => {
        if(lads.length > 0){
            for (let index = 0; index < lads.length; index++) {
                const element = await lads[index].getLeagueScore();
                resultString.push(element);
            }

            resultString = resultString.sort((a, b) => (a.StablefordPoints < b.StablefordPoints) ? 1 : -1)
            let lastPoints = -1;
            let lastPosition = 1;
            for (let indx = 0; indx < resultString.length; indx++) {
                const element = resultString[indx];
                if(indx == 0){
                    element.Position = indx + 1;
                }
                else{
                    element.Position = lastPoints == element.StablefordPoints ? lastPosition : (indx + 1);    
                }

                lastPoints = element.StablefordPoints;
                lastPosition = element.Position;
            }

            for (let i = 0; i < resultString.length; i++) {
                const element = resultString[i];
                let pts = 0;

                switch (element.Position) {
                    case 1:
                        pts = 8;
                        break;
                    case 2:
                        pts = 6;
                        break;
                    case 3:
                        pts = 5;
                        break;
                    case 4:
                        pts = 4;
                        break;
                    case 5:
                        pts = 3;
                        break;
                    case 6:
                        pts = 2;
                        break;
                    case 7:
                        pts = 1;
                        break;
                    case 8:
                        pts = 0;
                        break;                                                                                          
                    default:
                        break;
                }

                element.BonusPoints = pts;

                console.log('pts is : ' + pts);

                await AGTGolfLad.findByIdAndUpdate(element.PlayerID, {$set: {bonusPoints: pts }}, {new: true}).then(newOne => {
                    console.log('newOne.bonusPoints: ' + newOne.bonusPoints);
                }).catch(err => {
                    console.log(err);
                })

                console.log(element.PlayerName + ' finished in ' + element.Position + ' position so gets ' + pts + ' points');
            }

            return res.status(200).json(resultString);
        } else {
            return res.status(404).json('No lads found');
        }
    
    }).catch(err =>{
        return res.status(400).json(err);
    })
})

//golf lad by id
router.get('/agtGolfLad/:id', async (req, res) => {
    AGTGolfLad.findOne({_id : req.params.id}).then(lad => {
        if(lad != undefined){
            return res.status(200).json(lad);
        } else {
            return res.status(404).json('No lad found with id ' + req.params.id);
        }
    }).catch(err =>{
        return res.status(400).json(err);
    })
})

router.get('/agtGolfLad/:id/profilePicture', function(req,res,next) {
    AGTGolfLad.findById( req.params.id, function(err,golfLad) {
        if (err) return next(err);
        if(golfLad.profilePicture.data != null){
            res.contentType(golfLad.profilePicture.contentType);
            res.status(200).send(golfLad.profilePicture.data);
        }else{
            res.status(404).send([]);
        }
    });
  });


router.delete('/agtGolfScores/all', async (req, res) =>{
    await AGTGolfLad.find({}).then(async theLads => {


        return res.status(200).json(theLads);
    }).catch(err => {
        return res.status(400).json(err);
    })
})

router.post('/agtGolfScores/:holeNum', async (req, res) =>{

    let postData = req.body.playersScores;
    let holeNumber = req.params.holeNum;
    let courseID = postData.courseId;    
    console.log('postData is: ' + postData);
    console.log('postData.courseId is: ' + postData.courseId);
    console.log('postData.playersScores is ' + postData.playersScores);
    let course = null;
    let theRoundNumber = 0;
    await AGTGolfCourse.findById(courseID).then(async playingCourse =>{
        if(playingCourse != null){
            course = playingCourse;
            theRoundNumber = playingCourse.courseName.includes('Old Course') ? 1 : playingCourse.courseName.includes('Ocean Course') ? 2 : 3
        } else {
            return res.status(400).json("No course found with that ID");
        }
    }).catch(err =>{
        return res.status(400).json(err);
    })

    let hole = course.holes.find(x => x.holeNumber == holeNumber);

    let players = postData.players; 
    let Retvals = [];

    for (let index = 0; index < players.length; index++) {
        
        let newLad;
        const element = postData.players[index];

        await AGTGolfLad.findById(element.id).then(theLad => {
            if(theLad != undefined){
                newLad = theLad;
            } else{
                return res.status(400).json(err);
            }
        }).catch(err => {
            return res.status(400).json(err);
        })

        let scr = await newLad.calculateStablefordScore(element.strokes, hole);

        let newHoleScore = new AgtHoleScore({
            stableFordScore : scr,
            strokesScore : element.strokes,
            golfLadName : newLad.displayName,
            holeNumber : hole.holeNumber,
            holePar : hole.par
        })

        console.log('newHoleScore is' + newHoleScore)
        console.log('holepar is' + newHoleScore.holePar)

        if(newLad.currentScore == null || newLad.currentScore.complete){
            let newGolfScore = new AgtGolfScore({
                roundNumber : theRoundNumber,
                holeNumber : hole.holeNumber,
                holePar : hole.par,
                datePlayed : Date.now(),
                stablefordTotalScore : scr,
                strokesTotalPlayed : element.strokes,
                holesPlayed : 1,
                course : course
            })
            newGolfScore.holeScores.push(newHoleScore);
            newLad.currentScore = newGolfScore;
            newLad.historicalScores.push(newLad.currentScore);
        } else {
            if(newLad.currentScore.holeNumber != hole.holeNumber){
                newLad.currentScore.roundNumber = theRoundNumber;
                newLad.currentScore.holeNumber = hole.holeNumber;
                newLad.currentScore.holePar = hole.par;
                newLad.currentScore.stablefordTotalScore += parseInt(scr);
                newLad.currentScore.strokesTotalPlayed += parseInt(element.strokes);
                newLad.currentScore.course = course;
                newLad.currentScore.holeScores.push(newHoleScore);
                newLad.currentScore.holesPlayed = newLad.currentScore.holeScores.length;
                newLad.currentScore.complete = newLad.currentScore.holeScores.length == 18;
                
                newLad.historicalScores[theRoundNumber - 1] = newLad.currentScore;
            } else { 
                return res.status(404).json('You have already added this hole.... have not set up overwriting yet');
            }
        } 

        if(newLad.currentScore.complete == true && newLad.currentScore.roundNumber < 3) {
            console.log('deleting current score cos it should be historical now anyway...');
            newLad.scoringGroup = 0;
            newLad.currentScore = null; 

            if(newLad.historicalScores.length == 2){
                if(newLad.historicalScores[1].complete && newLad.bonusPoints == -1){

                }
            }
        }

        await AGTGolfLad.findByIdAndUpdate(element.id, newLad, {new : true}).then(imNew =>{
            Retvals.push(imNew);
        }).catch(err =>{
            return res.status(400).json(err);
        })
    } 
    return res.status(200).json(Retvals);
})

router.post('/agtGolfCourse', async (req, res) => {
    let golfHoles = [];
    let indexes = req.body.indexes.split(',');
    let parStrokes = req.body.parStrokes.split(',');

    for (let index = 1; index <= 18; index++) {
        let si = indexes[index - 1];
        let p = parStrokes[index - 1];
        const element = new AGTGolfCourseHole({
            holeNumber : index,
            par : p,
            strokeIndex : si
                }) ;               
        golfHoles.push(element);
    }

    //console.log(golfHoles);

    let newCourse = new AGTGolfCourse({
        courseName: req.body.courseName,
        holes : golfHoles
    })

    newCourse.save().then( gc => { 
        return res.status(200).json(gc);
    })
})

router.get('/agtGolfCourses', async (req, res) => {
    AGTGolfCourse.find({}).then(courses =>{
        if(courses != undefined){
            return res.status(200).json(courses);
        }else{
            return res.status(200).json('No courses found');
        }
    }).catch(err =>{
        return res.status(400).json(err);
    })
})

//golf lad by id
router.put('/agtGolfLad', async (req, res) => {
    let updatedAgtGolfLad = JSON.parse(req.body.updatedUser);
    AGTGolfLad.findByIdAndUpdate(updatedAgtGolfLad._id, updatedAgtGolfLad, {new:true}).then(async newLad => {
        if(newLad != undefined){
            return res.status(200).json(newLad);
        }
    })

})

module.exports = router;