require('dotenv').config();
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

var cs = process.env.MCS || '';
mongoose.connect(cs,{useNewUrlParser:true,useUnifiedTopology:true});
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

  // User model schema
  const userSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
      unique: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'customer'],
      default: 'customer'
    },
    orders: {
        type: Array,
        required: true,
        default: []   
    }
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
