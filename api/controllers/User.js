const User = require("../models/User");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const bcrypt = require("bcrypt");
const register = async (req,res)=>{
    const {username,password} = req.body;
    const user = new User({username,password});
    try{
        const newUser = await user.save();
        jwt.sign({userId:newUser._id,username},process.env.SECRET,{},(err,token)=>{
            if(err) throw err;
            res.cookie('token',token).status(201).json({"id":newUser._id});
        })
    }
    catch(error){
        console.log(error);
        res.status(400).json("Invalid credentials provided");
    }
}

const profile = (req,res)=>{
    const token = req.cookies?.token;
    if(token){
        jwt.verify(token,process.env.SECRET,{},(err,userData)=>{
            if(err) throw err;
            res.json(userData);
        })
    }
    else{
        res.status(401).json("no token");
    }
}

const login = async (req,res)=>{
    const {username,password} = req.body;
    try{
        const user = await User.findOne({username});
        if(user){
            const passOk = await bcrypt.compare(password,user.password);
            if(passOk){
                jwt.sign({userId:user._id,username},process.env.SECRET,{},(err,token)=>{
                    if(err) throw err;
                    res.cookie('token',token).json({"id":user._id});
                });
            }
            else{
                throw error("Invaild credentails");
            }
        }
        else{
            throw error("Invaild credentails");
        }
    }
    catch(error){
        res.status(400).json(error);
    }
}

const getAllUsers = async (req,res)=>{
    const users = await User.find({},'_id username');
    res.json(users);
}

const logout = (req,res)=>{
    res.cookie("token","").json("ok");
}

module.exports = {register,profile,login,getAllUsers,logout};