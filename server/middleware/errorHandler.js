function errorHandler(err,req,res,next){
    if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
            success: false,
            message: "File too large (max 5MB)."
        });
    }

    if (err.code === 11000) {
        return res.status(409).json({
            success: false,
            message: "A record with this value already exists."
        });
    }

    if (err.name === "ValidationError") {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }

    const status = err.status || 500;
    console.error(err);
    res.status(status).json({
        success: false,
        message: err.message || 'Something went wrong',
    });
}

export default errorHandler;