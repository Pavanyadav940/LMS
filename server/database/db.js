import mongoose from 'mongoose';

const connectDB = async() => {
     try{
         await mongoose.connect(process.env.MONGO_URI);
            console.log("mongodb Connected");
     }
     catch(err){
        console.log("Error in connecting to database",err)
     }
} 
export default connectDB;