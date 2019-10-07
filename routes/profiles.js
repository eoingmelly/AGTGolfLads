
const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const AGTGolfLad = require('../models/agtGolfLad');

router.get('/profile/:agtGolfLadId', ensureAuthenticated, async function(req, res, next) {
    AGTGolfLad.findById(req.params.agtGolfLadId).then(golfLad => {
        if(golfLad != undefined){            
            return res.render('profile', {golfLad});
        } else{
            return res.status(404).send("Couldn't find him...");
        }
    }).catch(err => { 
        return res.status(404).send("Couldn't find him with err : " + err);
    })
});

router.get('/', ensureAuthenticated, async function(req, res, next) {
    AGTGolfLad.find({}).then(golfLads => {
        if(golfLads != undefined){            
            return res.render('profiles', {golfLads});
        } else{
            return res.status(404).send("Couldn't find them...");
        }
    }).catch(err => { 
        return res.status(404).send("Couldn't find them with err : " + err);
    })
    
});



module.exports = router;