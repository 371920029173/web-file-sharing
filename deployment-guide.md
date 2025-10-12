# 文件分享平台部署指南

## 🚀 部署选项

### 选项1：Vercel（推荐免费）

#### 步骤：
1. **准备代码**
   ```bash
   git add .
   git commit -m "准备部署"
   git push origin main
   ```

2. **连接Vercel**
   - 访问 [vercel.com](https://vercel.com)
   - 使用GitHub账号登录
   - 导入你的仓库
   - 自动部署

3. **配置环境变量**
   - 在Vercel Dashboard中添加环境变量
   - 复制 `.env.local` 中的所有变量

4. **自定义域名**（可选）
   - 购买域名（如：`yourdomain.com`）
   - 在Vercel中配置DNS

#### 优点：
- ✅ 完全免费
- ✅ 自动部署
- ✅ 全球CDN
- ✅ 自动HTTPS
- ✅ 官方Next.js支持

### 选项2：VPS服务器

#### 步骤：
1. **购买VPS**
   - 推荐：DigitalOcean ($5/月)
   - 系统：Ubuntu 20.04

2. **服务器配置**
   ```bash
   # 更新系统
   sudo apt update && sudo apt upgrade -y
   
   # 安装Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # 安装PM2
   sudo npm install -g pm2
   
   # 安装Nginx
   sudo apt install nginx -y
   ```

3. **部署应用**
   ```bash
   # 克隆代码
   git clone your-repo-url
   cd your-app
   
   # 安装依赖
   npm install
   
   # 构建应用
   npm run build
   
   # 启动应用
   pm2 start npm --name "file-sharing" -- start
   ```

4. **配置Nginx**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

5. **配置SSL**
   ```bash
   # 安装Certbot
   sudo apt install certbot python3-certbot-nginx -y
   
   # 获取SSL证书
   sudo certbot --nginx -d yourdomain.com
   ```

## 🔒 Google AdSense合规检查

### 内容要求：
- ✅ 原创内容
- ✅ 有价值信息
- ✅ 定期更新
- ✅ 无抄袭内容

### 技术要求：
- ✅ HTTPS强制
- ✅ 移动端友好
- ✅ 加载速度快
- ✅ 无恶意代码

### 用户体验：
- ✅ 导航清晰
- ✅ 广告位置合理
- ✅ 无弹窗干扰
- ✅ 内容易访问

## 📊 性能优化

### 1. 图片优化
```javascript
// next.config.js
module.exports = {
  images: {
    domains: ['your-supabase-domain.supabase.co'],
    formats: ['image/webp', 'image/avif'],
  },
}
```

### 2. 代码分割
```javascript
// 动态导入组件
const DynamicComponent = dynamic(() => import('./Component'), {
  loading: () => <p>加载中...</p>
})
```

### 3. 缓存策略
```javascript
// 静态资源缓存
export async function getStaticProps() {
  return {
    props: { data },
    revalidate: 3600, // 1小时重新验证
  }
}
```

## 🎯 部署后检查清单

- [ ] 网站可以正常访问
- [ ] HTTPS正常工作
- [ ] 移动端显示正常
- [ ] 所有功能正常工作
- [ ] 加载速度<3秒
- [ ] 无JavaScript错误
- [ ] 环境变量配置正确
- [ ] 数据库连接正常

## 💰 成本估算

### Vercel（免费）：
- 域名：$10-15/年（可选）
- 总计：$0-15/年

### VPS部署：
- VPS：$5-20/月
- 域名：$10-15/年
- 总计：$70-255/年

## 🚨 注意事项

1. **备份数据**：定期备份Supabase数据
2. **监控性能**：使用Vercel Analytics或Google Analytics
3. **安全更新**：定期更新依赖包
4. **内容审核**：确保用户上传内容合规
5. **广告合规**：遵循Google AdSense政策

## 📞 技术支持

- **Vercel文档**：https://vercel.com/docs
- **Next.js部署**：https://nextjs.org/docs/deployment
- **Supabase文档**：https://supabase.com/docs
- **Google AdSense**：https://support.google.com/adsense 