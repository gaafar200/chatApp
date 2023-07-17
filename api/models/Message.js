const mongoose = require("mongoose");

const MessageSchema = mongoose.Schema({
    sender:{
        type: mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },
    recipient:{
        type:mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },
    text:{
       type:String,
    },
    file:{
        type: String
    }
});

const Message = mongoose.model("Message",MessageSchema);

module.exports = Message;