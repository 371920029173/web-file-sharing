# 🔧 环境变量配置指南

## 🚨 问题诊断
你的应用无法登录的根本原因是：**缺少 `.env.local` 文件，Supabase客户端无法连接到正确的数据库**。

## 📋 解决步骤

### 第一步：创建 .env.local 文件
在项目根目录创建 `.env.local` 文件，内容如下：

```bash
# Supabase配置（必需）
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# 其他配置（可选）
NEXT_PUBLIC_APP_NAME=文件分享平台
NEXT_PUBLIC_APP_VERSION=2.0.0
```

### 第二步：获取Supabase配置信息
1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 进入 "Settings" → "API"
4. 复制以下信息：
   - **Project URL**: `https://xxx.supabase.co`
   - **anon public key**: 以 `eyJ...` 开头的长字符串

### 第三步：更新 .env.local 文件
将实际的配置信息填入：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://mmnulghurqohukuobusj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 第四步：重启开发服务器
```bash
# 停止当前服务器 (Ctrl+C)
# 然后重新启动
npm run dev
```

## 🔍 验证配置

### 检查控制台输出
启动后应该看到：
```
✅ Supabase配置正确: { url: 'https://xxx.supabase.co', hasKey: true }
✅ Supabase连接测试成功
```

### 如果没有 .env.local 文件
会看到错误：
```
❌ Supabase环境变量未配置！
请创建 .env.local 文件并配置以下变量:
```

## ⚠️ 注意事项

1. **文件位置**: `.env.local` 必须在项目根目录
2. **文件格式**: 不要有引号，直接写值
3. **重启必需**: 修改环境变量后必须重启服务器
4. **不要提交**: `.env.local` 应该添加到 `.gitignore`

## 🎯 预期结果

配置正确后：
- ✅ 应用能正常启动
- ✅ 控制台显示Supabase连接成功
- ✅ 用户注册和登录功能正常工作
- ✅ 不再有"Invalid login credentials"错误

## 🆘 如果还有问题

1. **检查文件路径**: 确保 `.env.local` 在正确位置
2. **检查格式**: 确保没有多余的空格或引号
3. **检查权限**: 确保文件有读取权限
4. **重启服务器**: 环境变量修改后必须重启

## 📁 文件结构示例

```
web/
├── .env.local          ← 创建这个文件
├── app/
├── components/
├── lib/
└── package.json
```

现在去创建 `.env.local` 文件吧！这是解决问题的关键。 