const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
var bodyParser = require('body-parser')
const passport = require('passport');
const session = require('express-session');
const flash = require('connect-flash');
var path = require('path'); 


require('dotenv').config({ path: './config/dev.env' });

const app = express();




// EJS
app.use(expressLayouts);
//app.set('views', __dirname + '\\views');

app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd() + '/views')); 
// DB Config
const db = require('./config/keys').mongoURI;

// Passport Config
require('./config/passport')(passport);

// Express session
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
);

// Connect flash
app.use(flash());

//app.use(express.static(__dirname + '/public'));
app.use(express.static( path.join(process.cwd() + '/public')));

// Global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});



// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect to MongoDB

mongoose.set('useFindAndModify', false);
mongoose
  .connect(
    db,
    { useNewUrlParser: true }
  )
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

  app.use(bodyParser.json() );       // to support JSON-encoded bodies
  app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

  //Routes Defined
  app.use('/', require('./routes/index.js'));
  app.use('/api', require('./routes/api.js'));
  app.use('/users', require('./routes/users.js'));
  app.use('/standings', require('./routes/standings.js'));
  app.use('/profiles', require('./routes/profiles.js'));
  app.use('/scoring', require('./routes/scoring.js'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server started on port ${PORT}`));
