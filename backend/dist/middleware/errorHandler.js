export const errorHandler = (error, req, res, next) => {
    let { statusCode = 500, message } = error;
    // 处理特定类型的错误
    if (error.name === 'ValidationError') {
        statusCode = 400;
        message = '数据验证失败';
    }
    else if (error.name === 'CastError') {
        statusCode = 400;
        message = '无效的数据格式';
    }
    else if (error.name === 'MongoError' && error.code === 11000) {
        statusCode = 409;
        message = '数据已存在';
    }
    // 记录错误日志
    console.error('Error:', {
        message: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString(),
    });
    // 在生产环境中不暴露错误详情
    if (process.env.NODE_ENV === 'production' && statusCode === 500) {
        message = '服务器内部错误';
    }
    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    });
};
export const createError = (message, statusCode = 500) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.isOperational = true;
    return error;
};
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
//# sourceMappingURL=errorHandler.js.map