import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import customerRouter from "./routers/customerRouter";
import userRouter from "./routers/userRouter";
import authRouter from "./routers/userRouter";
import blogRouter from "./routers/blogRouter"
import mongoDB from "./config/db";
import { errorHandler } from "./middleware/errorMiddleware";
  
const PORT = process.env.PORT || 5000; 

const app = express();
 
// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
 
// Routes
app.use("/api/v1/customer", customerRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/blog", blogRouter)

// index.ts හි routes සියල්ලටම පසුව
app.use(errorHandler);
 
// Database Connection
mongoDB();

app.listen(PORT, () => {
  console.log(`Server is running on port : ${PORT}`);
});