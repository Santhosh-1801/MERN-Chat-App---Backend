const express=require('express');
const { registerUser, authUser, getallUsers } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router=express.Router();

router.route("/").post(registerUser).get(protect,getallUsers);
router.post("/login",authUser)


module.exports=router