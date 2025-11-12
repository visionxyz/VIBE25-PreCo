# AI Presales Copilot - 快速启动指南

## 🚀 快速开始

### 前置要求
- Node.js 18+
- Python 3.11+
- OpenAI API Key

---

## 📦 安装步骤

### 1️⃣ 配置后端

```bash
cd backend

# 激活虚拟环境
source venv/bin/activate  # Mac/Linux
# 或 venv\Scripts\activate  # Windows

# 创建.env文件
cp .env.example .env

# 编辑.env文件,添加你的OpenAI API Key
# OPENAI_API_KEY=sk-...
```

### 2️⃣ 配置前端

```bash
cd frontend

# (依赖已安装)
```

---

## 🎯 启动应用

### 启动后端服务器

```bash
cd backend
source venv/bin/activate
python main.py
```

后端将运行在: `http://localhost:8000`

### 启动前端服务器

打开**新的终端窗口**:

```bash
cd frontend
npm run dev
```

前端将运行在: `http://localhost:3000`

---

## 📱 使用说明

### 客户端视图 (主页面)
访问: `http://localhost:3000`

1. **开始对话**: 在输入框中描述你的项目需求
2. **多轮交互**: AI会基于你的需求提问并给出建议
3. **生成提案**: 满意后点击"生成项目提案"按钮下载文档

### 工程师视图
访问: `http://localhost:3000/engineer`

查看:
- **用户画像**: 行业、技术背景、需求分析
- **产品构思**: 功能模块、技术栈、实施路线图

---

## 🧪 测试示例对话

试试这些示例:

```
🧑‍💼 你: 我想做一个AI驱动的药物溶解度预测应用,能在手机上用

🤖 AI: 很好的想法!我们可以基于公司现有的分子嵌入模块来构建...

🧑‍💼 你: 我们的研究团队大约10人,技术背景一般

🤖 AI: 了解。考虑到团队背景,我建议...

🧑‍💼 你: 预算在50万人民币左右,希望3个月内上线MVP

🤖 AI: 基于这个预算和时间,我推荐以下实施方案...
```

---

## ⚙️ 当前功能状态

✅ **已实现**:
- 多轮对话 (OpenAI GPT-4o)
- 智能需求分析
- 自动生成项目提案
- 工程师侧视图

🔄 **计划中** (未实现):
- RAG检索 (向量数据库集成)
- 基于内部代码库的方案推荐
- 多语言切换
- 会话持久化

---

## 🔑 重要提示

1. **API Key安全**:
   - ⚠️ 不要将`.env`文件提交到Git
   - ⚠️ `.env.example`仅作为模板

2. **后端必须先启动**: 前端依赖后端API

3. **端口冲突**:
   - 如果8000或3000端口被占用,修改对应配置

---

## 🐛 常见问题

### Q: 前端报错"Failed to process request"
A: 检查后端是否正常运行 (http://localhost:8000)

### Q: API调用失败
A: 验证`.env`中的`OPENAI_API_KEY`是否正确

### Q: 依赖安装失败
A: 确保Python 3.11+和Node.js 18+版本

---

## 📚 下一步

1. **添加RAG功能**: 集成向量数据库和内部知识库
2. **增强UI**: 添加打字机效果、更好的样式
3. **会话管理**: 支持多个项目会话
4. **部署**: 配置Docker和云端部署

---

## 🎨 项目结构

```
yc/
├── backend/           # FastAPI后端
│   ├── main.py       # 主应用文件
│   ├── requirements.txt
│   └── .env          # API密钥 (需创建)
├── frontend/         # Next.js前端
│   ├── app/
│   │   ├── page.tsx          # 客户聊天界面
│   │   ├── engineer/page.tsx # 工程师视图
│   │   └── api/              # API路由
│   └── components/
│       └── chat-interface.tsx
└── README_AI_Presales_Copilot.md
```

---

**祝使用愉快! 🚀**
