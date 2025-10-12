@echo off
echo 文件分享平台启动脚本
echo ========================
echo.
echo 正在检查依赖...
if not exist "node_modules" (
    echo 依赖未安装，正在安装...
    npm install
    if errorlevel 1 (
        echo 依赖安装失败！
        pause
        exit /b 1
    )
    echo 依赖安装完成！
    echo.
)

echo 正在启动开发服务器...
echo 访问地址: http://localhost:3000
echo 按 Ctrl+C 停止服务器
echo.
npm run dev
pause 