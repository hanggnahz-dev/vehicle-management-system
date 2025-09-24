import Joi from 'joi';
// 用户数据验证模式
const userSchema = Joi.object({
    name: Joi.string().min(2).max(50).required().messages({
        'string.min': '姓名至少需要2个字符',
        'string.max': '姓名不能超过50个字符',
        'any.required': '姓名是必填项',
    }),
    email: Joi.string().email().required().messages({
        'string.email': '请输入有效的邮箱地址',
        'any.required': '邮箱是必填项',
    }),
    password: Joi.string().min(6).max(100).required().messages({
        'string.min': '密码至少需要6个字符',
        'string.max': '密码不能超过100个字符',
        'any.required': '密码是必填项',
    }),
    status: Joi.string().valid('active', 'inactive').default('active').messages({
        'any.only': '状态只能是active或inactive',
    }),
});
// 更新用户数据验证模式
const updateUserSchema = Joi.object({
    name: Joi.string().min(2).max(50).messages({
        'string.min': '姓名至少需要2个字符',
        'string.max': '姓名不能超过50个字符',
    }),
    email: Joi.string().email().messages({
        'string.email': '请输入有效的邮箱地址',
    }),
    password: Joi.string().min(6).max(100).messages({
        'string.min': '密码至少需要6个字符',
        'string.max': '密码不能超过100个字符',
    }),
    status: Joi.string().valid('active', 'inactive').messages({
        'any.only': '状态只能是active或inactive',
    }),
}).min(1); // 至少需要一个字段
// 验证用户数据
export const validateUserData = (data) => {
    return userSchema.validate(data, { abortEarly: false });
};
// 验证更新用户数据
export const validateUpdateUserData = (data) => {
    return updateUserSchema.validate(data, { abortEarly: false });
};
// 车辆数据验证模式
const vehicleSchema = Joi.object({
    company_name: Joi.string().min(2).max(100).required().messages({
        'string.min': '公司名称至少需要2个字符',
        'string.max': '公司名称不能超过100个字符',
        'any.required': '公司名称是必填项',
    }),
    license_plate: Joi.string().min(5).max(20).required().messages({
        'string.min': '车牌号至少需要5个字符',
        'string.max': '车牌号不能超过20个字符',
        'any.required': '车牌号是必填项',
    }),
    inspection_date: Joi.date().required().messages({
        'date.base': '审证日期格式不正确',
        'any.required': '审证日期是必填项',
    }),
});
// 更新车辆数据验证模式
const updateVehicleSchema = Joi.object({
    company_name: Joi.string().min(2).max(100).messages({
        'string.min': '公司名称至少需要2个字符',
        'string.max': '公司名称不能超过100个字符',
    }),
    license_plate: Joi.string().min(5).max(20).messages({
        'string.min': '车牌号至少需要5个字符',
        'string.max': '车牌号不能超过20个字符',
    }),
    inspection_date: Joi.date().messages({
        'date.base': '审证日期格式不正确',
    }),
}).min(1);
// 角色数据验证模式
const roleSchema = Joi.object({
    name: Joi.string().min(2).max(50).required().messages({
        'string.min': '角色名称至少需要2个字符',
        'string.max': '角色名称不能超过50个字符',
        'any.required': '角色名称是必填项',
    }),
    description: Joi.string().max(500).allow('').messages({
        'string.max': '角色描述不能超过500个字符',
    }),
    status: Joi.string().valid('active', 'inactive').default('active').messages({
        'any.only': '状态只能是active或inactive',
    }),
});
// 更新角色数据验证模式
const updateRoleSchema = Joi.object({
    name: Joi.string().min(2).max(50).messages({
        'string.min': '角色名称至少需要2个字符',
        'string.max': '角色名称不能超过50个字符',
    }),
    description: Joi.string().max(500).allow('').messages({
        'string.max': '角色描述不能超过500个字符',
    }),
    status: Joi.string().valid('active', 'inactive').messages({
        'any.only': '状态只能是active或inactive',
    }),
}).min(1);
// 验证车辆数据
export const validateVehicleData = (data) => {
    return vehicleSchema.validate(data, { abortEarly: false });
};
// 验证更新车辆数据
export const validateUpdateVehicleData = (data) => {
    return updateVehicleSchema.validate(data, { abortEarly: false });
};
// 验证角色数据
export const validateRoleData = (data) => {
    return roleSchema.validate(data, { abortEarly: false });
};
// 验证更新角色数据
export const validateUpdateRoleData = (data) => {
    return updateRoleSchema.validate(data, { abortEarly: false });
};
// 登录数据验证模式
const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': '请输入有效的邮箱地址',
        'any.required': '邮箱是必填项',
    }),
    password: Joi.string().min(6).required().messages({
        'string.min': '密码至少需要6个字符',
        'any.required': '密码是必填项',
    }),
});
// 验证登录数据
export const validateLoginData = (data) => {
    return loginSchema.validate(data, { abortEarly: false });
};
// 验证ID参数
export const validateId = (id) => {
    const idSchema = Joi.number().integer().positive().required();
    return idSchema.validate(id);
};
//# sourceMappingURL=validation.js.map