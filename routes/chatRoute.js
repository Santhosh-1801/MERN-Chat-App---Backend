const express=require('express');
const { accessChat, fetchChat, createGroupChat, renameGroupName, addtoGroup, removefromGroup } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

const router=express.Router();

router.route("/").post(protect,accessChat);
router.route("/").get(protect,fetchChat)
router.route("/group").post(protect,createGroupChat);
router.route("/rename").put(protect,renameGroupName);
router.route("/groupremove").put(protect,removefromGroup);
router.route("/groupadd").put(protect,addtoGroup);


module.exports=router