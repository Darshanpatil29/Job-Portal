import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app=express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,  // Allow requests from this origin (configured through environment variable)
    credentials: true  // Include credentials in CORS requests (e.g., cookies)
}));

app.use(cookieParser());

app.use(express.json({limit:'16kb'}));

app.use(express.urlencoded({extended:true}));

app.use(express.static('public'));

import userRoutes from './routes/user.routes.js';

app.use('/api/v1/users',userRoutes);

export {app};