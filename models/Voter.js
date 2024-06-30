const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const voterSchema = new mongoose.Schema
({
   name: { type: String, required: true },
   age: { type: Number, required: true },
   work: { type: String, required: true },
   mobile: { type: String, required: true }  ,
   email: { type: String, required: true, unique:true },
   address: { type: String, required: true },
   aadharCardNumber:{ type:String, required:true,unique:true},
   password:{type:String,required:true},
   role:{type:String,enum:['voter','admin'],default:'voter'},
   isVoted:{type:Boolean,default:false}
});

voterSchema.pre('save', async function(next) {
   const voter = this;
   if(!voter.isModified('password'))  return next();   
   try { 
           const salt = await bcrypt.genSalt(10);
           const hashedPassword = await bcrypt.hash(voter.password,salt);
           voter.password = hashedPassword;
            next();
       }catch(err){
           return next(err);
       }
   });
   
   voterSchema.methods.comparePassword = async function(candidatePassword)
   {
       try
       {
            const isMatch = await bcrypt.compare(candidatePassword,this.password);
            return isMatch;
       }catch(err){
           throw err;
       }
   };

const Voter = mongoose.model('Voter',voterSchema);
module.exports = Voter;
