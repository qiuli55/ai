# NOVA 项目全量知识库

> 本文档为 WorkBuddy 知识库专用，涵盖 NOVA（speek）项目的完整技术细节、架构决策、已知问题和开发规范。

---

## 一、项目身份

| 字段 | 值 |
|------|-----|
| 项目名称 | NOVA（原 speek） |
| 项目路径 | `E:\编程\我的ai(网页版)\` |
| 代码仓库 | `github.com/qiuli55/ai` (master 分支) |
| 开发阶段 | 个人项目，持续迭代中 |
| 开发模式 | 独立全栈开发 |

---

## 二、技术栈详解

### 后端
| 组件 | 技术选型 | 原因 |
|------|----------|------|
| Web 框架 | Flask | 轻量、快速原型、Python 生态 |
| 数据库驱动 | PyMySQL | 纯 Python，无需编译 |
| 实时推送 | SSE (Server-Sent Events) | 比 WebSocket 简单，单向推送够用 |
| 密码加密 | bcrypt | 加盐哈希，抗彩虹表 |
| 文件解析 | 正则表达式 | 轻量，无需额外依赖 |

### 前端
| 组件 | 技术选型 | 原因 |
|------|----------|------|
| UI 框架 | 无框架，原生 HTML/CSS/JS | 快速迭代，避免框架学习成本 |
| 流式渲染 | EventSource API | 浏览器原生 SSE 支持 |
| 语音输入 | Web Speech API | 浏览器原生，无需服务端 |
| 状态管理 | DOM 直接操作 | 项目规模小，不需要 React/Vue |

### AI 模型
| 模型 | 部署位置 | 用途 | 成本 |
|------|----------|------|------|
| qwen3:4b | Ollama 本地 (11434) | 日常对话 | 免费 |
| Doubao Seed 2.1 Pro | 火山 ARK 云端 | 深度思考/复杂推理 | 按量付费 |
| DeepSeek-V3 | 火山 ARK 云端 | 备选/文件生成 | 按量付费 |

---

## 三、数据库设计

### users 表
```
id, username, password_hash, avatar, created_at, updated_at
```

### conversations 表
```
id, user_id, character_id, title, created_at, updated_at
```

### messages 表
```
id, conversation_id, role(user/assistant), content, model_used, created_at
```

### characters 表
```
id, user_id, name, avatar, system_prompt, learned(JSON), 
total_rounds, learn_threshold, created_at, updated_at
```

### announcements 表
```
id, title, content, created_at, is_active
```

---

## 四、API 路由完整清单

### 核心对话
| 路由 | 方法 | 说明 | 关键逻辑 |
|------|------|------|----------|
| `/api/chat` | POST | SSE 流式对话 | `_call_model_stream()` → 路由决策 → 流式推送 |
| `/api/voice` | POST | ARK ASR 语音识别 | 上传音频 → ARK API → 返回文本 |
| `/api/tts` | POST | ARK TTS 语音合成 | 文本 → ARK API → 返回音频文件 |

### 用户认证
| 路由 | 方法 | 说明 |
|------|------|------|
| `/api/register` | POST | 注册（bcrypt 哈希密码） |
| `/api/login` | POST | 登录（Session 管理） |
| `/api/user/password` | POST | 修改密码 |
| `/api/user/avatar` | POST | 头像上传 |
| `/api/user/delete` | POST | 账号注销（级联删除） |
| `/api/forgot/reset` | POST | 重置密码 |

### 人格系统
| 路由 | 方法 | 说明 |
|------|------|------|
| `/api/character` | GET/POST | 角色人设 CRUD |
| `/api/character/learn` | POST | 手动触发记忆学习 |
| `/api/character/learn-file` | POST | 从文件批量学习 |
| `/api/bot/avatar` | POST | AI 角色头像 |
| `/api/memory` | GET/POST | 对话记忆管理 |
| `/api/title` | POST | 自动生成对话标题 |

### 系统工具
| 路由 | 方法 | 说明 |
|------|------|------|
| `/api/health` | GET | 健康检查 |
| `/api/llm-test` | GET | Ollama 连接测试 |
| `/api/ark-test` | GET | ARK 连接测试 |
| `/api/routing-log` | GET | 路由调度日志 |
| `/api/announcements` | GET | 公告列表 |
| `/api/upload` | POST | 文件上传 |

---

## 五、模型路由决策逻辑

```
1. 检查 deep_think 参数
   ├── true → 优先 ARK (Doubao Seed 2.1 Pro)
   └── false → 优先本地 Ollama (qwen3:4b)

2. 本地 Ollama 可用性检查
   ├── 可用 → 使用本地模型
   └── 不可用 → 回退到 ARK

3. 文件生成请求
   └── 强制使用 ARK（本地模型文件生成不稳定）

4. 记录路由日志 → /api/routing-log
```

---

## 六、已知问题和修复

### #1 qwen3:4b 思考模式兼容性 ✅已修复
- **现象**：本地 Ollama 模型无回复
- **根因**：Ollama 使用 `delta.reasoning` 字段，ARK 使用 `delta.reasoning_content`
- **修复**：`_ollama_request()` 中改为 `delta.get("reasoning_content", "") or delta.get("reasoning", "")`
- **位置**：`speek/backend.py` 约第 505 行
- **修复日期**：2026-07-23

### #2 流式响应断流处理
- **现象**：网络波动导致 SSE 流中断
- **处理**：前端 EventSource 有 `onerror` 重连逻辑，后端有 try/except 兜底

### #3 AI 文件生成安全护栏
- **风险**：模型可能生成恶意代码或超大文件
- **防护**：
  - 扩展名白名单：.txt .html .py .js .css .md .json .csv
  - 文件大小限制：500KB
  - 正则提取文件内容，非文件内容不落盘

---

## 七、开发规范

### 后端改动流程（用户硬性要求）
1. 先停掉正在运行的后端进程（端口 7860）
2. 改代码
3. 验证
4. 再重新启动

### 代码提交
- 提交信息用中文
- 推送走直连 GitHub（无需代理）
- .env 和敏感信息已 gitignore

### 环境变量（.env）
```
ARK_API_KEY=你的火山方舟API密钥（见 .env 文件）
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=speek
DB_PASSWORD=speek_pass
DB_NAME=speek
LOCAL_LLM_MODEL=qwen3:4b
LOCAL_LLM_URL=http://127.0.0.1:11434/v1/chat/completions
```

---

## 八、文件结构速查

```
E:\编程\我的ai(网页版)\
├── .env                          # 环境变量（敏感）
├── README.md                     # 项目 README
├── docs/screenshots/             # 截图
├── homepage/                     # 产品首页
├── auth/                         # 登录/注册页
└── speek/
    ├── backend.py                # Flask 后端 (2036行) ⭐核心文件
    ├── index.html                # 聊天页面
    ├── app.js                    # 前端逻辑 (2209行) ⭐核心文件
    ├── style.css                 # 样式 (2033行)
    ├── create_tables.sql         # 建表脚本
    ├── requirements.txt          # Python 依赖
    ├── character_profile.json     # 默认角色
    ├── announcements.json        # 公告
    ├── launch.py                 # 启动脚本
    ├── migrate.py                # 迁移工具
    ├── data/users/               # 用户数据 (gitignored)
    ├── genfiles/                 # AI 生成文件
    ├── temp_audio/               # TTS 临时音频
    └── uploads/                  # 用户上传
```

---

## 九、部署运维

### 本地启动
```bash
cd "E:/编程/我的ai(网页版)"
python speek/backend.py
# 服务运行在 http://localhost:7860
```

### 停止服务
```bash
netstat -ano | grep ":7860" | grep LISTEN
taskkill /F /PID <PID>
```

### 外网访问
- frp 内网穿透
- 端口映射：7860

### Ollama 守护
- PowerShell 脚本监控 Ollama 进程
- 崩溃自动重启
