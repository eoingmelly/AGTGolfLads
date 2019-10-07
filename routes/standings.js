const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const AGTGolfLad = require('../models/agtGolfLad');


router.get('/', ensureAuthenticated, async (req, res) => {
    res.locals.user = req.user;
    AGTGolfLad.find({}).then(golfLads => {
        if(golfLads != undefined){
            return res.render('standings', {data: golfLads});
        } else{
            return res.status(404).send("Couldn't find them...");
        }
    }).catch(err => {
        return res.status(404).send("Couldn't find him with err : " + err);
    })
});

router.get('/parthrees', ensureAuthenticated, async (req, res) => {
    res.locals.user = req.user;
    AGTGolfLad.find({}).then(golfLads => {
        if(golfLads != undefined){
            return res.render('parthreestandings', {data: golfLads});
        } else{
            return res.status(404).send("Couldn't find them...");
        }
    }).catch(err => {
        return res.status(404).send("Couldn't find him with err : " + err);
    })
});



module.exports = router;
