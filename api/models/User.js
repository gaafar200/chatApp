const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const userShema = mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    lastSeenAt:{
        type:Date,
        default: Date.now()
    }
},{timestamps: true});

userShema.pre("save",function(next){
    const saltRounds = 10;
    this.password = bcrypt.hashSync(this.password,saltRounds);
    next();
});

const User = mongoose.model("User",userShema);
module.exports = User;