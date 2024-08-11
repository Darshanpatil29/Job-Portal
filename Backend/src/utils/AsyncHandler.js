const AsyncHandler=(fn)=>async(req,res,next)=>{
    try{
    return await Promise.resolve(fn(req,res,next))
    }catch(err){
        return next(err);
    }
}