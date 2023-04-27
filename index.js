require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
var session = require("express-session");
var cookieParser = require("cookie-parser");
const mongoose = require('mongoose');
var Ms = require("connect-mongo");
const adminHandler = require('./handlers/adminHandler');
const customerHandler = require('./handlers/custHandler');
const User = require('./models/userModel');

const app = express();
app.use(cookieParser());
const PORT = process.env.PORT|| 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB
var ConnString = process.env.MCS || '';
mongoose.connect(ConnString, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Failed to connect to MongoDB', err));

app.use(session({
        key: "user_sid",
        secret: "IDONTKNOW",
        resave: false,
        saveUninitialized: false,
        store: Ms.create({
          mongoUrl: process.env.MCS,
          ttl: 600,
          autoRemove: 'native'
        }),
      })
);

var sessionChecker = (req, res, next) => {
  if (req.session.user!=undefined) {
    res.status(400).json({ error: 'Session active!! Logout first' });  }
  else{
      next();
    }
};


app.post("/signup",sessionChecker,async (req,res)=>{
    try {
        var user = new User({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            role: req.body.role || undefined
        });
        await user.save();
    }
    catch (err) {
        console.log(err);
        res.status(400).json({fail: "Failed!! Try new unique email"});
        return;
    }
    req.session.user = user;
    req.session.save();
    res.status(200).json({success : 'Registered'});
    });

app.post("/login", sessionChecker ,async(req,res)=>{
    var useremail = req.body.email;
    var password = req.body.password;

      try {
        var user = await User.findOne({ email: useremail }).exec();
        //console.log("User found in db"+user);
         if(!user) {
             //console.log("went to login frm if");
            res.status(404).json({error:'User not found'});
        }
        user.comparePassword(password, (error, match) => {
            if(!match) {
              res.status(400).json({error:'Pswd incorrect'});
            }
        });
        req.session.user = user;
        req.session.save();
        res.status(200).json({success : 'Logged In'});
    } catch (error) {
      console.log(error)
    }
})

app.get("/logout",(req,res)=>{
    if (req.session.user && req.cookies.user_sid) {
        req.session.destroy();
        res.status(200).json({success : 'Logged out'})
        } 
      else {
        res.status(404).json({err:'session not found'});
        }
})

// Admin Routes
app.use('/admin', adminHandler);
// Customer Routes
app.use('/customer', customerHandler);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
