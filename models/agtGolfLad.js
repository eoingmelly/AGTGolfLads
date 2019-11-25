const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const agtGolfScore = require('../models/agtGolfScore');
const agtGolfHole = require('../models/agtGolfCourseHole');
const agtCompetitionHistory = require('../models/agtCompetitionHistory');

var Schema = mongoose.Schema;

var agtGolfLadSchema = new Schema({
   password: String,
   username : String,
   displayname: String,
   displayQuote: String,
   active: Boolean,
   handicap : Number,
   currentScore : agtGolfScore.schema,
   odds : String,
   historicalScores: [agtGolfScore.schema],
   bonusPoints : {type:Number, default: -1},
   profile : {type: String, default: "We need some more information"},
   profilePicture : { data: Buffer, contentType: String },
   scoringGroup : {type: Number, default:0},
   competitionHistory : agtCompetitionHistory.schema,
   fburl : String,
   liurl : String,
   insturl : String
});

agtGolfLadSchema.statics.UsernameExists = async (valueToCheck) => {
  let resp = null;
  console.log('Checking username or email exists...');

  await AgtGolfLad.find({ username: valueToCheck }).then(user => {
    resp = user;
    return user.length > 0;
  }).catch(error => {
    console.log(error);
    return true;
  });
  
};

agtGolfLadSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({_id:user._id.toString()}, process.env.AGT_SECRET)
    user.tokens = user.tokens.concat({token})

    return token;
  
}

agtGolfLadSchema.methods.calculateStablefordScore = async function (strokesPlayed, holePlayed) {
  const user = this
  let par = holePlayed.par;
  let result = 0;
  let thisHandicap = user.handicap;
  //console.log(user.displayname + ' - has a handicap of ' + user.handicap);
  
  if( strokesPlayed == 0){
    return 0;
  }

  if(user.handicap > 18){
    //console.log(user.displayname + ' - has a handicap of ' + user.handicap);
    par = par + 1;
    thisHandicap = user.handicap - 18; 
  } 
  
  if(thisHandicap >= holePlayed.strokeIndex){
    par = par + 1;
  }
  
  while (strokesPlayed <= (par + 1)) {
      result++;
      strokesPlayed++;
  }

  return result;

}

agtGolfLadSchema.methods.getCurrentRoundScore = async function () {

  let textResult = this.displayname + "'s current score is ";
  if(this.currentScore == null){
    return textResult = this.displayname + " has not registered a round yet";
  } else {
    textResult +=  this.currentScore.strokesTotalPlayed + " strokes played, for " + this.currentScore.stablefordTotalScore + " points through " + this.currentScore.holesPlayed + " holes.";
  }
  let result = {
    "PlayerID" : this._id,
    "PlayerName" : this.displayname,
    "StrokesPlayed" : this.currentScore.strokesTotalPlayed,
    "StablefordPoints" : this.currentScore.stablefordTotalScore,
    "HolesPlayed" : this.currentScore.holesPlayed,
    "TextResult" : textResult
  }
  return result;
}

agtGolfLadSchema.methods.getLeagueScore = async function () {
  let roundsOneAndTwo = this.historicalScores.filter(x => x.roundNumber == 1 || x.roundNumber == 2);

  let stableFordScore = 0;
  let strokesPlayed = 0
  let holesPlayed = 0;
  let r1Points = 0;
  let r2Points = 0;
  let r1Strokes = 0;
  let r2Strokes = 0;
  let textResult = this.displayname ;
  let bonusPoints = this.bonusPoints;

  for (let index = 0; index < roundsOneAndTwo.length; index++) {
    const element = roundsOneAndTwo[index];
    //console.log('R: ' + element.roundNumber + ' >  score: ' + element.stablefordTotalScore);
    stableFordScore += parseInt(element.stablefordTotalScore);
    holesPlayed += parseInt(element.holesPlayed);
    strokesPlayed += parseInt(element.strokesTotalPlayed);

    if(element.roundNumber == 1){
      r1Points = element.stablefordTotalScore;
      r1Strokes = element.strokesTotalPlayed;
    }
    if(element.roundNumber == 2){
      r2Points = element.stablefordTotalScore;
      r2Strokes = element.strokesTotalPlayed;
    }
  }

  if(this.strokesPlayed == 0){
    textResult = this.displayname + " has not registered a score yet";
  } else {
    textResult += " played " + strokesPlayed + " strokes, for " + stableFordScore + " points through " + holesPlayed + " holes.";
  }
  
  let result = {
    "PlayerID" : this._id,
    "PlayerName" : this.displayname,
    "StrokesPlayed" : strokesPlayed,
    "RoundOnePoints" : r1Points,
    "RoundOneStrokes" : r1Strokes,
    "RoundTwoPoints" : r2Points,
    "RoundTwoStrokes" : r2Strokes,
    "StablefordPoints" : stableFordScore,
    "HolesPlayed" : holesPlayed,
    "TextResult" : textResult,
    "BonusPoints" : bonusPoints
  }
 
  return result;
}

const datesAreOnSameDay = (first, second) =>
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate();

agtGolfLadSchema.methods.getChampionshipSundayScore = async function () {

let textResult = this.displayname + "'s current score is ";
let result = {};
var sun = new Date(2019,9,13);

console.log('dates the same? : ' + datesAreOnSameDay(sun, this.historicalScores[this.historicalScores.length- 1].datePlayed));
console.log('last round played = ' + this.historicalScores[this.historicalScores.length- 1].datePlayed);
  
if(!datesAreOnSameDay(sun, this.historicalScores[this.historicalScores.length- 1].datePlayed)){
    textResult =  this.displayname + " has not started his final round yet..."
  result = {
    "PlayerID" : this._id,
    "PlayerName" : this.displayname,
    "StrokesPlayed" : 0,
    "StablefordPoints" : 0,
    "BonusPoints" : this.bonusPoints,
    "TotalPoints" : this.bonusPoints,
    "HolesPlayed" : 0,
    "TextResult" : textResult
  }
    return result;
  } 
  // else if(this.currentScore.roundNumber != 3  ){
  //   textResult =  this.displayname + " has not started his final round yet..."
  //   result = {
  //     "PlayerID" : this._id,
  //     "PlayerName" : this.displayname,
  //     "StrokesPlayed" : 0,
  //     "StablefordPoints" : 0,
  //     "BonusPoints" : this.bonusPoints,
  //     "TotalPoints" : this.bonusPoints,
  //     "HolesPlayed" : 0,
  //     "TextResult" : textResult
  //   }
  // }

  textResult +=  this.historicalScores[this.historicalScores.length- 1].strokesTotalPlayed + " strokes played, for " + 
  this.historicalScores[this.historicalScores.length- 1].stablefordTotalScore + " points through " + 
  this.historicalScores[this.historicalScores.length- 1].holesPlayed + " holes, plus a bonus of " + this.historicalScores[this.historicalScores.length- 1].bonusPoints + " based on his league position.";
 
  result = {
    "PlayerID" : this._id,
    "PlayerName" : this.displayname,
    "StrokesPlayed" : this.historicalScores[this.historicalScores.length- 1].strokesTotalPlayed,
    "StablefordPoints" : this.historicalScores[this.historicalScores.length- 1].stablefordTotalScore,
    "BonusPoints" : this.historicalScores[this.historicalScores.length- 1].bonusPoints,
    "TotalPoints" : parseInt(this.historicalScores[this.historicalScores.length- 1].bonusPoints + this.historicalScores[this.historicalScores.length- 1].stablefordTotalScore),
    "HolesPlayed" : this.historicalScores[this.historicalScores.length- 1].holesPlayed,
    "TextResult" : textResult
  }
  return result;
}

agtGolfLadSchema.methods.getParThreeScore = async function () {
  let allRounds = this.historicalScores;
  let parThreeCol = [];

  for (let index = 0; index < allRounds.length; index++) {
    for (let i = 0; i < allRounds[index].holeScores.length; i++) {
      const element = allRounds[index].holeScores[i];
      if(element.holePar == 3){
        console.log(this.displayname + ' score: ' + element.strokesScore)
        parThreeCol.push(element);
      }
    } 
  }

  

  let strokesPlayed = 0
  let holesPlayed = 0;
  let scoreToPar = 0;
  let textResult = this.displayname ;

  for (let index = 0; index < parThreeCol.length; index++) {
    const element = parThreeCol[index];
    holesPlayed++;
    
    strokesPlayed += element.strokesScore;

    scoreToPar += (element.strokesScore - 3)
    
  }

  if(holesPlayed == 0){
    textResult = this.displayname + " has not registered a score yet";
  } else {
    textResult += " played " + strokesPlayed + " strokes, over " + holesPlayed + " par threes for a score of +" + scoreToPar + ".";
  }
  
  let result = {
    "PlayerID" : this._id,
    "PlayerName" : this.displayname,
    "StrokesPlayed" : strokesPlayed,
    "ScoreToPar" : scoreToPar,
    "HolesPlayed" : holesPlayed,
    "TextResult" : textResult
  }
 
  return result;
}

agtGolfLadSchema.methods.convertBufferToImage = async function(buffer){
  var binary = '';
  var bytes = [].slice.call(new Uint8Array(buffer));
  bytes.forEach((b) => binary += String.fromCharCode(b));
  return window.btoa(binary);
}

agtGolfLadSchema.statics.findByCredentials = async (username,password) => {

  const user = await AgtGolfLad.findOne({username});

  if (!user) {
    console.log('user is null');
      throw new Error('Unable to login')
  }

   //const isMatch = 
   await bcrypt.compare(password, user.password, (err, match) => {
     if(err){
       console.log('error:' + err);
       throw new Error('Unable to login')
     }
     if(!match){
      console.log('pw doesnt match');
     }
     else{
      return user;
     }
   })

  return user;
}

agtGolfLadSchema.pre('save', function(next) {
  if(this.password.length < 25){
    try {
      bcrypt.genSalt(10, async (err, salt) => {
        if(err){
          console.log('genSalt Error');
          throw err;
        }
        bcrypt.hash(this.password, salt, async (err, hash) => {
          if (err){ 
            console.log('hashing error');
            throw err;
          }
          console.log('hash is: ' + hash);
          this.password = hash;

          return next();
        });
      });
    }
    catch(err){
      console.log(err);
    }
  }
  else{
    //console.log('password length is ' + this.password.length + ', so it must be hashed already, all good here.');
    return next();
  }
});



const AgtGolfLad = mongoose.model('AgtGolfLad', agtGolfLadSchema)


module.exports = AgtGolfLad;


