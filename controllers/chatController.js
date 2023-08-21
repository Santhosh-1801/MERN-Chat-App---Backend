const asyncHandler=require('express-async-handler');
const Chat=require('../models/chatModel');
const User = require('../models/userModel');

const accessChat=asyncHandler(async(req,res)=>{
   const {userID}=req.body;

   if(!userID){
    console.log("UserId param not sent with request");
    return res.sendStatus(400);
   }
   var isChat=await Chat.find({
    isGroupChat:false,
    $and:[
        {users:{$elemMatch:{$eq:req.user._id}}},
        {users:{$elemMatch:{$eq:userID}}}
    ]
   }).populate("users","-password").populate("latestMessage"); 

   isChat=await User.populate(isChat,{
    path:"latestMessage.sender",
    select:"name pic email"
   });
   if(isChat.length>0){
    res.send(isChat[0]);
   }
   else {
    var chatData={
        chatName:"sender",
        isGroupChat:false,
        users:[req.user._id,userID],
    }
   }
   try {
    const createdChat=await Chat.create(chatData);
    const FullChat=await Chat.findOne({_id:createdChat._id}).populate("users","-password")
    res.status(200).send(FullChat)
   } catch (error) {
    res.status(400);
    throw new Error(error.message)
   }

})

const fetchChat=asyncHandler(async(req,res)=>{
    try {
        Chat.find({users:{$elemMatch:{$eq:req.user._id}}}).populate("users","-password").populate("groupAdmin","-password").populate("latestMessage").sort({updatedAt:-1})
        .then(async(results)=>{
                results=await User.populate(results,{
                path:"latestMessage.sender",
                select:"name pic email",
            })
            res.status(200).send(results);
        })
        
    } catch (error) {
     res.status(401);
     throw new Error(error.message);   
    }
})

const createGroupChat=asyncHandler(async(req,res)=>{
if(!req.body.users || !req.body.name){
    return res.status(400).send({message:"Please fill all the details"});
}
var users=JSON.parse(req.body.users);
if(users.length<2){
    return res.status(400).send("More than 2 users are needed to have a group chat");
}
users.push(req.user);
try {
    const groupChat=await Chat.create({
        chatName:req.body.name,
        users:users,
        isGroupChat:true,
        groupAdmin:req.user
    })
    const fullGroupChat=await Chat.findOne({_id:groupChat._id}).populate("users","-password").populate("groupAdmin","-password");
    res.status(200).json(fullGroupChat)
} catch (error) {
    res.status(400);
    return new Error(error.message)
}
})

const renameGroupName=asyncHandler(async(req,res)=>{
   const {chatID,chatName}=req.body; 
   const updatedChat=await Chat.findByIdAndUpdate(chatID,{
    chatName,
   },{
    new:true
   }).populate("users","-password").populate("groupAdmin","-password");

if(!updatedChat){
    res.status(404);
    throw new Error("Chat not found")
}
else{
    res.json(updatedChat);

}
})

const addtoGroup=asyncHandler(async(req,res)=>{
    const {chatID,userID}=req.body 

    const addedperson=await Chat.findByIdAndUpdate(chatID,{
        $push:{users:userID},
    },{
        new:true,
    }).populate("users","-password").populate("groupAdmin","-password")
    if(!addedperson){
        res.status(404);
        return new Error("Chat is not found");
    }
    else {
        res.json(addedperson)
    }
})

const removefromGroup=asyncHandler(async(req,res)=>{
    const {chatID,userID}=req.body 

    const removedperson=await Chat.findByIdAndUpdate(chatID,{
        $pull:{users:userID},
    },{
        new:true,
    }).populate("users","-password").populate("groupAdmin","-password")
    if(!removedperson){
        res.status(404);
        return new Error("Chat is not found");
    }
    else {
        res.json(removedperson)
    }
})


module.exports={accessChat,fetchChat,createGroupChat,renameGroupName,addtoGroup,removefromGroup}