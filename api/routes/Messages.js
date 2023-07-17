const express = require("express");
const Message = require("../models/Message");
const jwt = require("jsonwebtoken");
const router = express.Router();

router.get("/:id",async (req,res)=>{
    const {id} = req.params;
    const token = req.cookies?.token;
    let user;
    if(token){
        jwt.verify(token,process.env.SECRET,{},(err,userData)=>{
            if(err) throw err;
            console.log(userData);
            user = userData;
        })
    }
    else{
        res.status(401).json("no token");
    }
    const {userId} = user;
    console.log(id);
    const messages = await Message.find({
        sender: {$in: [userId,id]},
        recipient: {$in: [userId,id]},
    }).sort({createdAt: 1});
    res.json(messages);
});

module.exports = router;