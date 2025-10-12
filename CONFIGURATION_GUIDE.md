# 🚀 文件分享平台配置指南

## 📋 快速开始

### 1. 环境变量配置

1. 复制环境变量模板：
```bash
cp env.example .env.local
```

2. 编辑 `.env.local` 文件，配置必要的服务

### 2. 安装依赖
```bash
npm install
```

### 3. 启动开发服务器
```bash
npm run dev
```

## 🔑 必需配置

### Supabase 数据库配置
```bash
# 从 Supabase 项目设置中获取
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**获取方法：**
1. 访问 [Supabase](https://supabase.com)
2. 创建新项目或选择现有项目
3. 进入 Settings > API
4. 复制 Project URL 和 anon/public key

### 安全密钥配置
```bash
# 生成随机密钥（至少32字符）
JWT_SECRET=your_32_character_jwt_secret_here
ENCRYPTION_KEY=your_32_character_encryption_key_here
SESSION_SECRET=your_session_secret_here
CSRF_SECRET=your_csrf_secret_here
```

**生成方法：**
```bash
# 使用 Node.js 生成随机密钥
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 🤖 AI 服务配置

### OpenAI API 配置
```bash
OPENAI_API_KEY=sk-your_openai_api_key_here
OPENAI_ORGANIZATION=your_openai_org_id_here  # 可选
```

**获取方法：**
1. 访问 [OpenAI Platform](https://platform.openai.com)
2. 登录或注册账户
3. 进入 API Keys 页面
4. 创建新的 API Key
5. 复制并保存密钥

### Anthropic Claude API 配置
```bash
CLAUDE_API_KEY=sk-ant-your_claude_api_key_here
```

**获取方法：**
1. 访问 [Anthropic Console](https://console.anthropic.com)
2. 注册或登录账户
3. 进入 API Keys 页面
4. 创建新的 API Key

### Google Gemini API 配置
```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

**获取方法：**
1. 访问 [Google AI Studio](https://aistudio.google.com)
2. 使用 Google 账户登录
3. 进入 API Keys 页面
4. 创建新的 API Key

## 🔒 安全服务配置

### 病毒扫描服务
```bash
# VirusTotal API（免费版每天限制500次）
VIRUSTOTAL_API_KEY=your_virustotal_api_key_here

# ClamAV 本地服务
CLAMAV_HOST=localhost
CLAMAV_PORT=3310
```

**VirusTotal 获取方法：**
1. 访问 [VirusTotal](https://www.virustotal.com)
2. 注册免费账户
3. 进入 API 页面获取密钥

### 图片处理服务
```bash
# Cloudinary 配置
CLOUDINARY_URL=your_cloudinary_url_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Cloudinary 获取方法：**
1. 访问 [Cloudinary](https://cloudinary.com)
2. 注册免费账户
3. 进入 Dashboard 获取配置信息

## 📧 邮件服务配置

### Gmail SMTP 配置
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@yourdomain.com
```

**Gmail 应用密码设置：**
1. 启用 Google 账户的 2FA
2. 进入 [Google 账户设置](https://myaccount.google.com)
3. 安全 > 应用专用密码
4. 生成新的应用密码

### 其他邮件服务商
```bash
# Outlook/Hotmail
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587

# QQ 邮箱
SMTP_HOST=smtp.qq.com
SMTP_PORT=587

# 163 邮箱
SMTP_HOST=smtp.163.com
SMTP_PORT=25
```

## 📊 监控和日志配置

### Sentry 错误监控
```bash
SENTRY_DSN=your_sentry_dsn_here
```

**获取方法：**
1. 访问 [Sentry](https://sentry.io)
2. 创建新项目
3. 复制 DSN 字符串

### 日志配置
```bash
LOG_LEVEL=info  # debug, info, warn, error
LOG_FORMAT=json  # json, simple
ENABLE_METRICS=true
METRICS_PORT=9090
```

## 🚀 生产环境配置

### 环境变量
```bash
NODE_ENV=production
DEBUG=false
ENABLE_SWAGGER=false
ENABLE_GRAPHQL_PLAYGROUND=false
LOG_LEVEL=warn
```

### 功能开关
```bash
FEATURE_AI_CHAT=true
FEATURE_PRIVATE_MESSAGES=true
FEATURE_FILE_PREVIEW=true
FEATURE_USER_ANALYTICS=true
FEATURE_ADMIN_PANEL=true
FEATURE_MODERATION=true
```

## 🔧 配置验证

### 1. 访问配置检查页面
启动应用后访问：`/admin/config`

### 2. 检查配置状态
- ✅ 绿色：配置正确
- ⚠️ 黄色：需要配置
- ❌ 红色：配置错误

### 3. 常见问题排查

#### AI 服务不可用
- 检查 API 密钥是否正确
- 确认账户余额充足
- 验证 API 限制和配额

#### 数据库连接失败
- 检查 Supabase 项目状态
- 验证 URL 和密钥
- 确认网络连接

#### 文件上传失败
- 检查存储配额
- 验证文件类型和大小限制
- 确认权限设置

## 📱 移动端配置

### PWA 配置
```bash
# 在 next.config.js 中配置
PWA_ENABLED=true
PWA_NAME=文件分享平台
PWA_SHORT_NAME=文件分享
PWA_DESCRIPTION=安全便捷的文件分享平台
```

### 响应式配置
```bash
# Tailwind CSS 断点配置
MOBILE_BREAKPOINT=768
TABLET_BREAKPOINT=1024
DESKTOP_BREAKPOINT=1280
```

## 🔐 安全最佳实践

### 1. 密钥管理
- 使用强密码（至少32字符）
- 定期轮换密钥
- 不要在代码中硬编码密钥
- 使用环境变量或密钥管理服务

### 2. 访问控制
- 启用速率限制
- 配置 IP 白名单（如需要）
- 使用 HTTPS
- 启用 CORS 保护

### 3. 数据保护
- 启用文件加密
- 配置备份策略
- 实施数据保留策略
- 定期安全审计

## 📈 性能优化配置

### 缓存配置
```bash
REDIS_URL=redis://localhost:6379
REDIS_TTL=3600
CACHE_ENABLED=true
```

### 数据库优化
```bash
DATABASE_POOL_SIZE=10
DATABASE_TIMEOUT=30000
QUERY_CACHE_ENABLED=true
```

### 文件处理
```bash
FILE_COMPRESSION=true
IMAGE_OPTIMIZATION=true
VIDEO_TRANSCODING=false
```

## 🆘 故障排除

### 常见错误

#### 1. "API Key Invalid"
- 检查 API 密钥格式
- 确认密钥未过期
- 验证账户状态

#### 2. "Rate Limit Exceeded"
- 检查 API 配额
- 调整速率限制设置
- 考虑升级服务计划

#### 3. "Database Connection Failed"
- 检查网络连接
- 验证数据库状态
- 确认连接字符串

### 获取帮助
- 查看应用日志
- 访问配置检查页面
- 联系技术支持
- 提交 GitHub Issue

## 📚 相关资源

- [Next.js 环境变量文档](https://nextjs.org/docs/basic-features/environment-variables)
- [Supabase 文档](https://supabase.com/docs)
- [OpenAI API 文档](https://platform.openai.com/docs)
- [Tailwind CSS 配置](https://tailwindcss.com/docs/configuration)

---

**配置完成后，重启应用以使所有更改生效！** 