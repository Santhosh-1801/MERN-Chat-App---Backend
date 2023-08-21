const express=require('express');
const {chats}=require('../backend/data/data')
const connectDB = require('./config/db');
const userRoute=require("./routes/userRoute")
const chatRoute=require("./routes/chatRoute")
const messageRoute=require("./routes/messageRoute")

const { errorHandler,notFound}=require('./middleware/errorMiddleware');


const dotenv=require('dotenv')

dotenv.config({ path: "./.env" });

connectDB()
const app=express(); 


app.use(express.json());

app.get("/",(req,res)=>{
    res.send("Server started")

})
app.use("/api/user",userRoute)
app.use("/api/chat",chatRoute)
app.use("/api/message",messageRoute)



app.use(notFound);
app.use(errorHandler);
const PORT=process.env.PORT || 5000
const server=app.listen(5000,console.log(`Server is started on PORT ${PORT}`)) 

const io=require('socket.io')(server,{
 pingTimeout:60000,
 cors:{
    origin:"http://localhost:3000",


 }
})
io.on("connection",(socket)=>{
    console.log("connected to socket.io")

    socket.on('setup',(userData)=>{
      socket.join(userData._id);
      console.log(userData._id);
      socket.emit("connected");
    })
    socket.on('join chat',(room)=>{
      socket.join(room);
      console.log("User Joined Room" +room);
    })
    socket.on("typing",(room)=>socket.in(room).emit("typing"));
    socket.on("stop typing",(room)=>socket.in(room).emit("stop typing"));
    socket.on("new message",(newMessagereceived)=>{
        var chat=newMessagereceived.chat;
        if(!chat.users){
            return console.log("chat.users not defined");

        }
        chat.users.forEach((user)=>{
            if(user._id==newMessagereceived.sender._id) return ;

            socket.in(user._id).emit("message received",newMessagereceived);
        })
    })
    socket.off("setup",()=>{
        console.log("User Disconnected");
        socket.leave(userData._id)
    })
})

