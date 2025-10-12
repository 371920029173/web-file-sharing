@echo off
chcp 65001 >nul
echo 🚀 开始准备项目部署...

echo 📋 检查环境...
node --version
if %errorlevel% neq 0 (
    echo ❌ Node.js 未安装或未在PATH中
    pause
    exit /b 1
)

echo 🧹 清理构建文件...
if exist .next rmdir /s /q .next
if exist out rmdir /s /q out
if exist dist rmdir /s /q dist

echo 📦 安装依赖...
npm install
if %errorlevel% neq 0 (
    echo ❌ 依赖安装失败
    pause
    exit /b 1
)

echo 🔨 测试构建...
npm run build
if %errorlevel% neq 0 (
    echo ❌ 构建失败，请检查错误信息
    pause
    exit /b 1
)

echo ✅ 构建成功！

echo 📁 检查关键文件...
set files=package.json next.config.js tailwind.config.js tsconfig.json vercel.json .gitignore README.md LICENSE
for %%f in (%files%) do (
    if exist %%f (
        echo ✅ %%f 存在
    ) else (
        echo ❌ %%f 缺失
    )
)

if exist env.example (
    echo ✅ env.example 存在
) else (
    echo ❌ env.example 缺失
)

echo.
echo 🎉 项目准备完成！
echo.
echo 📋 下一步操作：
echo 1. 将代码推送到GitHub仓库
echo 2. 在Vercel中导入项目
echo 3. 配置环境变量
echo 4. 部署应用
echo.
echo 📖 详细部署指南请查看: VERCEL_DEPLOYMENT_GUIDE.md
pause
