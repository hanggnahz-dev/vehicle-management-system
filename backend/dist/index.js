import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database.js';
import { errorHandler } from './middleware/errorHandler.js';
import userRoutes from './routes/userRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import roleRoutes from './routes/roleRoutes.js';
// 加载环境变量
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
// 安全中间件
app.use(helmet());
// CORS配置
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
}));
// 请求日志
app.use(morgan('combined'));
// 请求体解析
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
// 限流中间件
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 100, // 限制每个IP 15分钟内最多100个请求
    message: '请求过于频繁，请稍后再试',
});
app.use('/api', limiter);
// 健康检查
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});
// API路由
app.use('/api/users', userRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/roles', roleRoutes);
// 404处理
app.use('*', (req, res) => {
    res.status(404).json({
        error: '接口不存在',
        path: req.originalUrl,
    });
});
// 错误处理中间件
app.use(errorHandler);
// 启动服务器
const startServer = async () => {
    try {
        // 连接数据库
        await connectDatabase();
        app.listen(Number(PORT), '0.0.0.0', () => {
            console.log(`🚀 服务器运行在端口 ${PORT}`);
            console.log(`📊 健康检查: http://localhost:${PORT}/health`);
            console.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`);
        });
    }
    catch (error) {
        console.error('❌ 服务器启动失败:', error);
        process.exit(1);
    }
};
startServer();
export default app;
//# sourceMappingURL=index.js.map