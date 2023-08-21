const express=require('express');
const { protect } = require('../middleware/authMiddleware');
const { sendMessage, allMessages } = require('../controllers/messageController');
const router=express.Router();



router.route("/").post(protect,sendMessage);
router.route("/:chatID").get(protect,allMessages);




module.exports=router;
