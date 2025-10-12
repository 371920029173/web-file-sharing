# Vercel部署指南

## 🚀 部署步骤

### 1. 准备GitHub仓库
```bash
# 初始化Git仓库
git init
git add .
git commit -m "Initial commit"

# 推送到GitHub
git remote add origin https://github.com/yourusername/your-repo-name.git
git branch -M main
git push -u origin main
```

### 2. 配置Vercel
1. 访问 [vercel.com](https://vercel.com)
2. 使用GitHub账号登录
3. 点击 "New Project"
4. 选择你的GitHub仓库
5. 配置项目设置

### 3. 环境变量配置
在Vercel项目设置中添加以下环境变量：

#### 必需的环境变量
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

#### 可选的环境变量
```
NEXT_PUBLIC_APP_NAME=文件分享平台
NEXT_PUBLIC_APP_VERSION=2.0.0
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

### 4. 数据库设置
1. 在Supabase中运行 `database-setup.sql` 脚本
2. 确保存储桶权限配置正确
3. 测试数据库连接

### 5. 部署
- Vercel会自动检测到Next.js项目
- 每次推送到main分支都会自动部署
- 可以在Vercel Dashboard中查看部署状态

## 🔧 环境变量说明

### Supabase配置
- `NEXT_PUBLIC_SUPABASE_URL`: 你的Supabase项目URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: 匿名访问密钥
- `SUPABASE_SERVICE_ROLE_KEY`: 服务角色密钥（用于API）

### 应用配置
- `NEXT_PUBLIC_APP_NAME`: 应用名称
- `NEXT_PUBLIC_APP_VERSION`: 应用版本
- `NEXT_PUBLIC_APP_URL`: 生产环境URL

## 📱 部署后检查

### 1. 基本功能
- [ ] 页面正常加载
- [ ] 导航功能正常
- [ ] 响应式设计正常

### 2. 数据库功能
- [ ] 用户注册/登录
- [ ] 文件上传/下载
- [ ] 私信系统

### 3. 性能检查
- [ ] 页面加载速度
- [ ] API响应时间
- [ ] 错误日志

## 🚨 常见问题

### 1. 环境变量未生效
- 检查Vercel项目设置
- 重新部署项目
- 清除浏览器缓存

### 2. 数据库连接失败
- 检查Supabase配置
- 验证环境变量
- 检查网络连接

### 3. 构建失败
- 检查代码语法
- 查看构建日志
- 验证依赖配置

## 🔗 有用的链接

- [Vercel文档](https://vercel.com/docs)
- [Next.js部署](https://nextjs.org/docs/deployment)
- [Supabase文档](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 📞 支持

如果遇到问题：
1. 检查Vercel部署日志
2. 查看浏览器控制台错误
3. 验证环境变量配置
4. 检查Supabase连接状态 