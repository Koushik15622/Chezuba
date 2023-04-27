require('dotenv').config();
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

var cs = process.env.MCS || '';
mongoose.connect(cs,{useNewUrlParser:true,useUnifiedTopology:true,useCreateIndex:true});
var db = mongoose.connection;
db.on('connected', function() {
console.log("Users Successfully connected to MongoDB!");
});

db.on('error',function(err){
    console.log('Users connect error:'+err);
})
db.on('disconnected',function(){
    console.log('Users disconnected');
})

// LightningDeal model schema
const Deals = new mongoose.Schema({
    productName: { type: String, required: true },
    actualPrice: { type: Number, required: true },
    finalPrice: { type: Number, required: true },
    totalUnits: { type: Number, required: true },
    availableUnits: { type: Number, required: true },
    expiryTime: { type: Date, required: true },
  });
  
  const Deal = mongoose.model('Deals', Deals);
  
  // Order model schema
  const orderSchema = new mongoose.Schema({
    deal: { type: mongoose.Schema.Types.ObjectId, ref: 'LightningDeal', required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['Placed', 'Approved'], default: 'Placed' },
  });
  
  const Order = mongoose.model('Order', orderSchema);
  
  // User model schema
  const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'customer'], required: true },
  });
  userSchema.pre("save", function(next) {
    if(!this.isModified("password")) {
        return next();
    }
    this.password = bcrypt.hashSync(this.password, 10);
    next();
});

userSchema.methods.comparePassword = function(plaintext, callback) {
    return callback(null, bcrypt.compareSync(plaintext, this.password));
};
  
const User = mongoose.model('User', userSchema);

module.exports = User
module.exports = Order
module.exports = Deal