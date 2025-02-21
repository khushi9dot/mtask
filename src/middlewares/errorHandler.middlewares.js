const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || err.status || 500;

    console.error(
        `[ERROR] ${statusCode} - ${err.message} - ${req.method} ${req.url} - ${req.ip}`
    );

    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
        errors: err.errors || [],  // For validation errors
        data: err.data || null,
    });
};

export default errorHandler ;
