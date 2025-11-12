#!/bin/bash

echo "🚀 启动 AI Presales Copilot..."
echo ""

# 检查并清理已占用的端口
echo "🔍 检查端口占用情况..."

# 检查8000端口
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  端口 8000 已被占用,正在停止旧进程..."
    lsof -ti:8000 | xargs kill -9 2>/dev/null
    sleep 1
fi

# 检查3000端口
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  端口 3000 已被占用,正在停止旧进程..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null
    sleep 1
fi

# 检查OpenAI API Key
if ! grep -q "sk-" backend/.env 2>/dev/null; then
    echo "⚠️  警告: 请先在 backend/.env 中配置你的 OPENAI_API_KEY"
    echo "编辑文件: backend/.env"
    echo "将 'your_openai_api_key_here' 替换为你的实际API密钥"
    echo ""
    read -p "配置完成后按回车继续..."
fi

echo "📦 启动后端服务..."
cd backend
source venv/bin/activate
python main.py &
BACKEND_PID=$!
cd ..

echo "⏳ 等待后端启动..."
sleep 3

echo "🎨 启动前端服务..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ 服务启动成功!"
echo ""
echo "📱 客户端视图: http://localhost:3000"
echo "👨‍💻 工程师视图: http://localhost:3000/engineer"
echo "🔧 后端API: http://localhost:8000"
echo ""
echo "💡 提示: 打开浏览器访问上述地址开始使用"
echo "按 Ctrl+C 停止所有服务"
echo ""

# 等待用户中断
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo ''; echo '👋 服务已停止'; exit" INT
wait
