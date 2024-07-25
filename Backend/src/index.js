import dotenv from 'dotenv';
import connectDB from './db/index.js';
import {app} from './app.js';
dotenv.config(
    {
        path:'../env',
    }
)
// const PORT=5000;

// app.listen(PORT,()=>{
//     console.log(`Server is running on port ${PORT}`);
// });

connectDB().then(()=>{
    app.listen(process.env.PORT,()=>{
        console.log(`Server is running on port ${process.env.PORT}`);
    })
}).catch((err)=>{
    console.log("MONGO db connection failed !!! ",err);
});
