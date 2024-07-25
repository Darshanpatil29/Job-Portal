import express from 'express';
import cors from 'cors';


const app=express();
app.use(cors({
    origin: process.env.CORS_ORIGIN,  // Allow requests from this origin (configured through environment variable)
    credentials: true  // Include credentials in CORS requests (e.g., cookies)
  }));
export {app};