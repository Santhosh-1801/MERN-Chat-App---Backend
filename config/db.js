const mongoose=require('mongoose')


const connectDB=async()=>{
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
          useNewUrlParser: true,
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
        console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        console.log("Error in connecting")
        console.log(`Error:${error.message}`);
        process.exit();
    }
}
module.exports=connectDB