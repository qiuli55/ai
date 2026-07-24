# NOVA - 次世代数字生命体

基于 Flask + Ollama/ARK 的 AI 数字人对话平台。

## 功能

- 💬 智能对话（支持 ARK 云端 / Ollama 本地双模型）
- 🧠 深度思考模式（qwen3:4b / qwen3:8b 切换）
- 🎤 语音识别（Web Speech API + ARK）
- 👤 个性化人设（每条对话独立人格）
- 🔐 用户系统（注册/登录/密码管理）
- 🔔 通知公告面板
- 🔤 字体大小切换
- 📌 对话置顶
- 👁️ 密码小眼睛

## 技术栈

- **后端**：Python Flask + SSE 流式响应
- **前端**：HTML + CSS + JavaScript（原生）
- **LLM**：Ollama（本地）/ ARK（火山方舟云端）
- **认证**：SHA-256 + 盐值

## 快速开始

```bash
# 1. 安装依赖
pip install flask requests

# 2. 启动后端
python speek/backend.py

# 3. 访问
http://localhost:7860
```

默认使用 Ollama 本地模型，设置环境变量 `LLM_PROVIDER=ark` 可切换到 ARK 云端。
