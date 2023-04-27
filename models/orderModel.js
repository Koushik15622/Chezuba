require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./userModel');
const Deal = require('./dealModel');

var cs = process.env.MCS || '';
mongoose.connect(cs,{useNewUrlParser:true,useUnifiedTopology:true});
var db = mongoose.connection;
db.on('connected', function() {
console.log("Orders Successfully connected to MongoDB!");
});

db.on('error',function(err){
    console.log('Orders connect error:'+err);
})
db.on('disconnected',function(){
    console.log('Orders disconnected');
})

  // Order model schema
  const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true
    },
    userId: {
      type: String,
      required: true
    },
    dealId: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    totalPrice: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['Placed', 'Approved'],
      default: 'Placed'
    }
  });
  
  const Order = mongoose.model('Order', orderSchema);
  module.exports = Order

