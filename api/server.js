const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const userRouter = require("./routes/User");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const ws = require("ws");
const jwt = require("jsonwebtoken");
const Message = require("./models/Message");
const MessagesRouter = require("./routes/Messages");
const fs = require("fs");

const app = express();
const port = process.env.PORT || 3000;

app.use("/uploads",express.static( __dirname + "/uploads"))
app.use(express.json());
app.use(cookieParser());
app.use(cors({origin:process.env.CLIENT_URL,credentials:true}));
app.use(userRouter);
app.use("/messages",MessagesRouter);


const connectToDB = async ()=>{
    try{
        await mongoose.connect(process.env.DB_CONNECT);
        console.log("Connected to database");
    }
    catch(error){
        console.log(error);
        process.exit(-1);
    }
}
connectToDB();
const server = app.listen(port,()=> console.log(`Server is listening on port ${port}`));

const wss = new ws.WebSocketServer({server});

wss.on("connection",(connection,req)=>{
    function notifyAboutOnlineUsers(){
        [...wss.clients].forEach(client =>{
        client.send(JSON.stringify({
            online: [...wss.clients].map(c => ({userId:c.userId,username:c.username}))
        }))
    })
    }
    const cookies = req.headers.cookie;
    if(cookies){
        const tokenString = cookies.split(';').find(str => str.includes("token="));
        if(tokenString){
            const token = tokenString.split("=")[1];
            jwt.verify(token,process.env.SECRET,{},(err,data)=>{
                if(err) throw err;
                const {userId, username} = data;
                connection.userId = userId;
                connection.username = username;
            })
        }
    }
    connection.isAlive = true;
    connection.timer = setInterval(()=>{
        connection.ping()
        const deathTime = setTimeout(()=>{
            connection.isAlive = false;
            clearInterval(connection.timer);
            connection.terminate();
            notifyAboutOnlineUsers();
            console.log("dead");
        },2000)
    },5000);

    connection.on('pong',()=>{
        clearTimeout(connection.deathTime);
    })

    connection.on("message",async (message)=>{
        const messageObject = JSON.parse(message.toString()).message;
        const sender = connection.userId;
        const {recipient,text,file} = messageObject;
        let fileName = null;
        if(file){
            const parts = file.name.split('.');
            const ext = parts[parts.length - 1];
            fileName = Date.now() + '.' +  ext;
            const path = __dirname + '/uploads/' + fileName;
            const base64Data = file.data.split(',')[1];
            const buffer = new Buffer.from(base64Data,'base64');
            fs.writeFile(path,buffer,'base64',()=>{
                console.log(`File Saved: ${path}`);
            })

        }
        if(recipient && (text || file)){
            const message = new Message({sender,recipient,text,file:fileName});
            const newMessage = await message.save();
            const clientConnections = [...wss.clients].filter(c => c.userId === recipient)
            .forEach(c => c.send(JSON.stringify({
                _id:newMessage._id,
                text,
                sender,
                recipient,
                file:fileName
            })));
            
        }
    });
    notifyAboutOnlineUsers();
});