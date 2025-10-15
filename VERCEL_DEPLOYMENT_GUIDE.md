# Vercel 部署指南

## 1. 环境变量配置

在 Vercel Dashboard 中设置以下环境变量：

### 必需变量
```
NEXT_PUBLIC_SUPABASE_URL=你的Supabase项目URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的Supabase匿名密钥
SUPABASE_SERVICE_ROLE_KEY=你的Supabase服务角色密钥
```

### 应用配置
```
NEXT_PUBLIC_APP_NAME=文件分享平台
NEXT_PUBLIC_APP_VERSION=2.0.0
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

### 生产环境配置
```
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

### 文件上传配置
```
MAX_FILE_SIZE=104857600
UPLOAD_RATE_LIMIT=10
UPLOAD_RATE_LIMIT_WINDOW=60000
MAX_FILES_PER_USER=1000
```

### 功能开关
```
FEATURE_AI_CHAT=true
FEATURE_PRIVATE_MESSAGES=true
FEATURE_FILE_PREVIEW=true
FEATURE_USER_ANALYTICS=true
FEATURE_ADMIN_PANEL=true
FEATURE_MODERATION=true
```

## 2. 部署步骤

1. **连接 GitHub 仓库**
   - 在 Vercel Dashboard 中点击 "New Project"
   - 选择你的 GitHub 仓库

2. **配置项目设置**
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: npm run build
   - Output Directory: .next

3. **设置环境变量**
   - 在项目设置中添加上述环境变量
   - 确保所有必需变量都已设置

4. **部署**
   - 点击 "Deploy" 开始部署
   - 等待构建完成

## 3. 部署后检查

1. **功能测试**
   - 用户注册/登录
   - 文件上传/下载
   - 私信功能
   - 管理后台

2. **性能检查**
   - 页面加载速度
   - API 响应时间
   - 文件上传速度

3. **安全检查**
   - HTTPS 证书
   - 安全头设置
   - API 访问控制

## 4. 常见问题

### 构建失败
- 检查环境变量是否正确设置
- 确保所有依赖都已安装
- 查看构建日志中的具体错误

### 运行时错误
- 检查 Supabase 连接
- 验证 API 路由是否正常工作
- 查看 Vercel 函数日志

### 文件上传问题
- 检查 Supabase Storage 配置
- 验证文件大小限制
- 确认存储桶权限设置

## 5. 监控和维护

1. **性能监控**
   - 使用 Vercel Analytics
   - 监控 Core Web Vitals
   - 跟踪 API 响应时间

2. **错误监控**
   - 设置 Sentry 或类似服务
   - 监控用户报告的错误
   - 定期检查日志

3. **备份策略**
   - 定期备份 Supabase 数据
   - 保存重要配置文件
   - 维护部署历史记录
#### 文件上传配置
```
MAX_FILE_SIZE=104857600
UPLOAD_RATE_LIMIT=10
UPLOAD_RATE_LIMIT_WINDOW=60000
MAX_FILES_PER_USER=1000
ALLOWED_FILE_TYPES=image,video,audio,document,archive,code
```

#### 速率限制
```
RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

#### 生产环境配置
```
NODE_ENV=production
DEBUG=false
LOG_LEVEL=warn
LOG_FORMAT=json
```

### 第四步：部署
1. 点击 "Deploy"
2. 等待构建完成
3. 获得你的Vercel域名

## 🔧 部署后配置

### 1. 自定义域名（可选）
- 在Vercel项目设置中添加自定义域名
- 更新DNS记录指向Vercel

### 2. 环境变量更新
- 如果修改了环境变量，需要重新部署
- 或者使用Vercel CLI进行更新

### 3. 监控和日志
- 在Vercel Dashboard中查看部署状态
- 检查Function Logs和Build Logs

## 🧪 部署后测试

### 1. 基本功能测试
- 访问你的Vercel域名
- 测试用户注册和登录
- 测试文件上传功能
- 测试管理员后台

### 2. 硬编码管理员账户测试
- 用户名：`371920029173`
- 密码：`371920029173Abcd`
- 确认管理员权限正常

### 3. API测试
- 测试文件上传API
- 测试用户管理API
- 检查错误日志

## 🚨 常见问题

### 构建失败
- 检查环境变量是否正确
- 查看Build Logs中的错误信息
- 确保所有依赖都已安装

### 运行时错误
- 检查Function Logs
- 确认Supabase连接正常
- 验证环境变量在生产环境中可用

### 环境变量问题
- 确保所有必需变量都已设置
- 检查变量名拼写是否正确
- 确认变量值没有多余的空格

## 🎉 部署成功标志

当你看到：
- ✅ Vercel构建成功
- ✅ 网站能正常访问
- ✅ 用户注册和登录功能正常
- ✅ 文件上传功能正常
- ✅ 管理员后台正常

就说明部署成功了！

## 📞 需要帮助？

如果部署过程中遇到问题：
1. 检查Vercel Build Logs
2. 检查Function Logs
3. 确认环境变量配置
4. 查看Supabase连接状态

现在去Vercel部署吧！🚀 