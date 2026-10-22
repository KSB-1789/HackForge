function errorHandler(err,req,res,next){
    const status = err.status || 500;
    console.error(err);
    res.status(status).json({
        success: false,
        message: err.message || 'Something went wrong',
    });
}

export default errorHandler;