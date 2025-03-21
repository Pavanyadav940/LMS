import express from 'express';
import dotenv from 'dotenv';
import connectDB from './database/db.js';
import userRouter from "./routes/user.route.js"
import courseRoutes from "./routes/course.route.js"
import mediaRoutes from "./routes/media.route.js"
import cookieParser from 'cookie-parser';
import cors from "cors"
import purchaseRoute from "./routes/purchaseCourse.route.js";
import courseProgressRoute from "./routes/courseProgress.route.js";

dotenv.config({});

    // call the database connection here
    connectDB();
    const app=express(); 
    const PORT=process.env.PORT ||  3000;  
    
    //dafalut middleware
    app.use(express.json());
    app.use(cookieParser());
    app.use(cors({
      origin:"http://localhost:5173",
      credentials:true
    }));
   
   //  Apis
   app.use("/api/v1/user",userRouter)
   // apis will look like this -> localhost:8080/api/v1/user/register
   app.use("/api/v1/course",courseRoutes)
    // apis will look like this -> localhost:8080/api/v1/user/course
    app.use("/api/v1/media",mediaRoutes)
    // apis will look like this -> localhost:8080/api/v1/user/media
    app.use("/api/v1/purchase",purchaseRoute)
    app.use("/api/v1/progress",courseProgressRoute)
   
  
 app.listen(PORT,()=>{
    console.log(`server is listening on port ${PORT}`);
 })