import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    if (!token) {
        res.status(401).json({
            success: false,
            message: '访问令牌缺失',
        });
        return;
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        req.userId = decoded.userId;
        next();
    }
    catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            res.status(401).json({
                success: false,
                message: '访问令牌已过期',
            });
        }
        else if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({
                success: false,
                message: '无效的访问令牌',
            });
        }
        else {
            res.status(401).json({
                success: false,
                message: '令牌验证失败',
            });
        }
    }
};
// 可选认证中间件（不强制要求token）
export const optionalAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded;
        }
        catch (error) {
            // 忽略token验证错误，继续执行
        }
    }
    next();
};
//# sourceMappingURL=auth.js.map