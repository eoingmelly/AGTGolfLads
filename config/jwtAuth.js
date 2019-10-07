    
const jwt = require('jsonwebtoken')
const AGTGolfLad = require('../models/agtGolfLad')

const auth = async (req,res,next) => {
    console.log("Entered jwt Auth section");
    try {
        const token = req.header('Authorization').replace('Bearer ','')
        const decoded = jwt.verify(token, process.env.AGT_SECRET)
        const user = await AGTGolfLad.findOne({ _id: decoded._id, 'tokens.token': token})

        if(!user) {
            throw new Error()
        }
        req.token = token
        req.user = user

        next()
    } catch (e) {
        res.status(401).send({error: 'please authenticate!'})
    }
}

module.exports = auth