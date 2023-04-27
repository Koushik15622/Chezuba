require('dotenv').config();
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

var cs = process.env.MCS || '';
mongoose.connect(cs,{useNewUrlParser:true,useUnifiedTopology:true});
var db = mongoose.connection;
db.on('connected', function() {
console.log("Deals Successfully connected to MongoDB!");
});

db.on('error',function(err){
    console.log('Deals connect error:'+err);
})
db.on('disconnected',function(){
    console.log('Deals disconnected');
})

// LightningDeal model schema
const Deals = new mongoose.Schema({
    dealId: {type: String, required: true,unique: true},
    productName: { type: String, required: true },
    actualPrice: { type: Number, required: true },
    finalPrice: { type: Number, required: true },
    totalUnits: { type: Number, required: true },
    availableUnits: { type: Number, required: true },
    expiryTime: { type: Date, required: true },
});
  
const Deal = mongoose.model('Deals', Deals);
module.exports = Deal
