const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const AGTGolfLad = require('../models/agtGolfLad');

// Force Login Page
router.get('/', forwardAuthenticated, (req, res) => res.render('login'));

//Landing page once logged in and no comps on...
router.get('/welcome', ensureAuthenticated, function(req,res) {
    res.locals.user = req.user;
    AGTGolfLad.find({}).then(golfLads => {
        if(golfLads != undefined){
            return res.render('welcome', {golfLads});
        } else {
            return res.status(404).send("Couldn't find them...");
        }
    }).catch(err => {
        return res.status(404).send("Couldn't find him with err : " + err);
    })
});


module.exports = router; 
