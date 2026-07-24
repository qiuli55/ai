import os
import re
import time
import json
import uuid
import hashlib
import bcrypt
import threading
import shutil
import asyncio
import requests
from flask import Flask, request, jsonify, send_from_directory, Response, redirect

# ---- 清除可能继承到的失效代理 ----
# 后端只与 ARK(直连可达)、本机 Ollama/SoVITS 通信，不需要代理。
# 若环境继承了失效的 HTTPS_PROXY(如 127.0.0.1:7892 未启动)，
# requests 会强行走代理导致 ARK 连接被拒、聊天"未收到回复"。
# 这里在进程启动时显式清除代理环境变量，强制直连。
for _pv in ("HTTP_PROXY", "HTTPS_PROXY", "http_proxy", "https_proxy", "ALL_PROXY", "all_proxy"):
    os.environ.pop(_pv, None)

# ---- 路径与常量 ----
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
PROJECT_ROOT = os.path.dirname(BASE_DIR)
MEMORY_FILE = os.path.join(BASE_DIR, "chat_memory.json")
CHARACTER_FILE = os.path.join(BASE_DIR, "character_profile.json")
USERS_FILE = os.path.join(BASE_DIR, "users.json")
AUTH_DIR = os.path.join(PROJECT_ROOT, "auth")
HOME_DIR = os.path.join(PROJECT_ROOT, "homepage")
PROFILE_THRESHOLD = 8  # 自动学习：新增对话轮次达到此值即后台更新角色画像
TEMP_AUDIO_DIR = os.path.join(BASE_DIR, "temp_audio")
os.makedirs(TEMP_AUDIO_DIR, exist_ok=True)
AVATAR_DIR = os.path.join(BASE_DIR, "avatars")
os.makedirs(AVATAR_DIR, exist_ok=True)
BOT_AVATAR_DIR = os.path.join(BASE_DIR, "data", "bot_avatars")
os.makedirs(BOT_AVATAR_DIR, exist_ok=True)
ALLOWED_AVATAR_EXT = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
# 用户聊天附件
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
# AI 生成/返回的文件（由模型用 <<<FILE:名>>>...<<<END>>> 格式回传，后端解析落盘）
GENFILES_DIR = os.path.join(BASE_DIR, "genfiles")
os.makedirs(GENFILES_DIR, exist_ok=True)
# 活动信息 / 更新公告
ANNOUNCEMENTS_FILE = os.path.join(BASE_DIR, "announcements.json")
# 可作为文本直接喂给模型的附件后缀（≤ TEXT_ATTACH_LIMIT 字节）
TEXT_ATTACH_EXT = {".txt", ".md", ".markdown", ".json", ".csv", ".log", ".tsv",
                   ".py", ".js", ".ts", ".jsx", ".tsx", ".java", ".c", ".cpp", ".h",
                   ".hpp", ".html", ".htm", ".css", ".scss", ".xml", ".yaml", ".yml",
                   ".ini", ".conf", ".toml", ".sql", ".sh", ".bat", ".ps1", ".go",
                   ".rs", ".rb", ".php", ".swift", ".kt", ".r", ".lua"}
TEXT_ATTACH_LIMIT = 20000

# ---- 专属记忆库（每个账号一份，存于 data/users/<username>/memory.json）----
# memory.json 结构：{ task_count(对话任务个数), conversations(聊天内容), profile(AI 训练成果) }
DATA_ROOT = os.path.join(BASE_DIR, "data", "users")
os.makedirs(DATA_ROOT, exist_ok=True)

def safe_name(username):
    return re.sub(r'[^A-Za-z0-9_-]', '_', username or "guest")

def user_dir(username):
    d = os.path.join(DATA_ROOT, safe_name(username))
    os.makedirs(d, exist_ok=True)
    return d

def user_memory_path(username):
    return os.path.join(user_dir(username), "memory.json")

def _default_memory():
    return {
        "task_count": 0,
        "conversations": [],
        "profile": {"name": "小诺", "base_setting": "", "learned": "",
                    "learned_turns": 0, "updated_at": 0},
    }

def default_persona():
    """单条对话的默认人设（出厂空白态）。全局 profile 作为新对话的默认模板。"""
    return {"name": "小诺", "base_setting": "", "learned": "",
            "learned_turns": 0, "bot_avatar": None, "updated_at": 0,
            "persona_key": "", "persona_title": ""}

def ensure_persona(conv):
    """保证一个对话对象带有完整 persona 字段（兼容旧数据迁移）。"""
    if not isinstance(conv, dict):
        return conv
    p = conv.get("persona")
    if not isinstance(p, dict):
        p = default_persona()
        conv["persona"] = p
    for k, v in default_persona().items():
        p.setdefault(k, v)
    return conv

def _find_conversation(mem, conversation_id):
    if not conversation_id:
        return None
    for c in mem.get("conversations", []):
        if c.get("id") == conversation_id:
            return c
    return None

def _get_persona(username, conversation_id=None):
    """读取某对话的人设；无 conversation_id 时返回账号全局默认人设。"""
    if conversation_id:
        mem = load_user_memory(username)
        conv = _find_conversation(mem, conversation_id)
        if conv is not None:
            return ensure_persona(conv)["persona"]
    return load_user_profile(username)

def _set_persona(username, persona, conversation_id=None):
    """写回某对话的人设；无 conversation_id 时写全局默认人设。"""
    if conversation_id:
        mem = load_user_memory(username)
        conv = _find_conversation(mem, conversation_id)
        if conv is not None:
            conv["persona"] = persona
            save_user_memory(username, mem)
            return
    save_user_profile(username, persona)

def load_user_memory(username):
    path = user_memory_path(username)
    try:
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
            base = _default_memory()
            for k, v in base.items():
                data.setdefault(k, v)
            data["profile"].setdefault("name", "小诺")
            data["profile"].setdefault("learned_turns", 0)
            # 兼容旧数据：每条对话都必须带独立 persona
            for c in data.get("conversations", []):
                ensure_persona(c)
            data["task_count"] = len(data.get("conversations", []))
            return data
    except Exception:
        pass
    return _default_memory()

def save_user_memory(username, data):
    data = dict(data)
    convs = data.get("conversations", [])
    data["task_count"] = len(convs)
    path = user_memory_path(username)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def update_user_memory(username, patch):
    mem = load_user_memory(username)
    mem.update(patch)
    save_user_memory(username, mem)

def delete_user_memory(username):
    d = os.path.join(DATA_ROOT, safe_name(username))
    if os.path.isdir(d):
        shutil.rmtree(d, ignore_errors=True)

def load_user_profile(username):
    return load_user_memory(username)["profile"]

def save_user_profile(username, profile):
    mem = load_user_memory(username)
    mem["profile"] = profile
    save_user_memory(username, mem)

def count_pairs(conversations):
    n = 0
    for c in (conversations or []):
        msgs = c.get("messages", [])
        for i in range(len(msgs) - 1):
            if msgs[i].get("role") == "user" and msgs[i + 1].get("role") == "assistant":
                n += 1
    return n

ARK_API_KEY = os.environ.get("ARK_API_KEY", "YOUR_ARK_API_KEY_HERE")
ARK_CONFIGURED = bool(ARK_API_KEY) and ARK_API_KEY != "YOUR_ARK_API_KEY"
CHAT_MODEL_ID = "ep-m-20260714044607-f5tfj"
ARK_URL = "https://ark.cn-beijing.volces.com/api/v3/chat/completions"
# 语音转文字使用的音频理解模型（需在方舟控制台开通）。可用 ARK_ASR_MODEL 环境变量覆盖。
ASR_MODEL_ID = os.environ.get("ARK_ASR_MODEL", "ep-m-20260723034312-t27x7")

# ---- 本地大模型（Ollama，OpenAI 兼容，可选）----
# 默认使用本机 Ollama（qwen3:8b），设置环境变量 LLM_PROVIDER=ark 可切回 ARK。
# Ollama 暴露的 OpenAI 兼容端点与 ARK 返回格式一致，SSE 解析代码无需改动。
LLM_PROVIDER = os.environ.get("LLM_PROVIDER", "ollama").lower()
OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://localhost:11434/v1/chat/completions")
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "qwen3:8b")
OLLAMA_MODEL_DEEP = os.environ.get("OLLAMA_MODEL_DEEP", "qwen3:4b")
OLLAMA_MODEL_FAST = os.environ.get("OLLAMA_MODEL_FAST", "qwen3:4b")

app = Flask(__name__)


# ---- 通用 ----
@app.after_request
def no_cache(response):
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response


# ---- 记忆文件 ----
def init_memory_file():
    if not os.path.exists(MEMORY_FILE):
        with open(MEMORY_FILE, "w", encoding="utf-8") as f:
            json.dump([], f, ensure_ascii=False, indent=2)


def load_memory():
    init_memory_file()
    with open(MEMORY_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def save_memory(user_text, bot_text):
    memory = load_memory()
    memory.append({"user": user_text, "bot": bot_text})
    with open(MEMORY_FILE, "w", encoding="utf-8") as f:
        json.dump(memory, f, ensure_ascii=False, indent=2)


def load_chat_history():
    path = os.path.join(BASE_DIR, "chat_history.txt")
    try:
        with open(path, "r", encoding="utf-8") as f:
            return f"【历史聊天样本】\n{f.read()}"
    except Exception:
        return "暂无聊天记录"


history_content = load_chat_history()


# ---- 角色画像（从聊天记录学习人设，按账号隔离）----
def load_character(username=None):
    if username:
        return load_user_profile(username)
    return {"name": "小诺", "base_setting": "", "learned": "",
            "updated_at": 0, "learned_turns": 0}

def save_character(data, username=None):
    if username:
        save_user_profile(username, data)


def build_system_prompt(profile):
    name = (profile.get("name") or "AI").strip() or "AI"
    parts = [f"你是{name}。"]
    if profile.get("base_setting"):
        parts.append(profile["base_setting"].strip())
    if profile.get("learned"):
        parts.append("以下是你从过往对话中逐渐形成的稳定人设，请始终保持一致：\n"
                     + profile["learned"].strip())
    parts.append("请始终以该角色的身份、性格与语气回应，不要跳出角色，"
                 "也不要提及自己是人工智能、语言模型或程序。")

    # ---- 身份守卫 ----
    # 除非用户在角色设定（角色名 / 初始设定 / 已学人设）里明确把该角色设定为「豆包」，
    # 否则被问到「你是谁」时一律以角色身份（默认小诺）回应，绝不自称是豆包。
    identity_text = " ".join([
        name,
        profile.get("base_setting", "") or "",
        profile.get("learned", "") or "",
    ])
    if "豆包" not in identity_text:
        display_name = name if name != "AI" else "小诺"
        parts.append(
            f"当有人问你「你是谁」「你叫什么」「你是不是豆包」等身份问题时，"
            f"你要回答自己是{display_name}，绝对不要说自己是豆包，也不要透露任何底层模型来源。"
        )
    # ---- 让 AI 能「返回文件」给前端文档面板 ----
    # 当用户明确要求生成可下载的文件（文档/报告/代码/清单/表格等）时才使用，避免滥用。
    parts.append(
        "当用户要求生成「可下载的文档 / 报告 / 代码文件 / 清单 / 表格」等内容时，"
        "你可以把文件内容用以下格式放在回复里（可包含多个文件，内容要完整）：\n"
        "<<<FILE:文件名.后缀>>>\n"
        "<文件的完整内容，可多行>\n"
        "<<<END>>>\n"
        "除文件内容外，你也可以用自然语言补充说明。不要使用上述格式以外的特殊标记。"
    )
    return "\n".join(parts)


def call_model(prompt_messages, temperature=0.4, max_tokens=800):
    payload = {
        "model": CHAT_MODEL_ID,
        "messages": prompt_messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
        "stream": False,
    }
    headers = {
        "Authorization": f"Bearer {ARK_API_KEY}",
        "Content-Type": "application/json",
    }
    r = requests.post(ARK_URL, json=payload, headers=headers, timeout=120)
    r.raise_for_status()
    obj = r.json()
    return obj["choices"][0]["message"]["content"].strip()


def learn_from_excerpt(username, excerpt_raw, conversation_id=None):
    """把一段对话文本（excerpt）提炼/合并进该账号（或指定对话）的角色人设。"""
    try:
        excerpt = (excerpt_raw or "")[:12000]
        if not excerpt.strip():
            return
        profile = _get_persona(username, conversation_id)
        if profile.get("learned"):
            sys_text = (
                "你是一个角色人设维护器。下面给出角色【现有人设】和【新增对话片段】。"
                "请将新片段中稳定、可复用的性格/语言/背景信息合并进现有人设，去除重复，"
                "保持简洁（中文，分点，不超过 300 字）。只输出更新后的人设文本，不要解释。"
            )
            user_text = f"【现有人设】\n{profile['learned']}\n\n【新增对话片段】\n{excerpt}"
        else:
            sys_text = (
                "你是一个角色人设提炼器。下面是一段角色与用户的对话记录。"
                "请从中提炼出该角色稳定、可复用的性格特质、语言风格、口头禅、背景设定、"
                "喜好与禁忌，整理成简洁的人设描述（中文，分点，不超过 300 字）。"
                "只输出人设文本，不要解释。"
            )
            user_text = (f"【角色初始设定】\n{profile.get('base_setting', '')}\n\n"
                         f"【对话记录】\n{excerpt}")
        result = call_model([
            {"role": "system", "content": sys_text},
            {"role": "user", "content": user_text},
        ])
        if result:
            profile["learned"] = result
            profile["updated_at"] = int(time.time())
            _set_persona(username, profile, conversation_id)
            tag = f"对话 {conversation_id}" if conversation_id else "全局"
            print(f"【角色画像已更新·{username}·{tag}】from file/context")
    except Exception as e:
        print("【角色画像(文件)更新失败】", str(e))


def update_profile(username, conversation_id=None):
    """从指定账号（或指定对话）的对话中提炼/合并角色人设并持久化。"""
    try:
        mem = load_user_memory(username)
        if conversation_id:
            conv = _find_conversation(mem, conversation_id)
            if conv is None:
                return None
            conversations = [conv]
        else:
            conversations = mem.get("conversations", [])
        pairs = []
        for c in conversations:
            msgs = c.get("messages", [])
            for i in range(len(msgs) - 1):
                if msgs[i].get("role") == "user" and msgs[i + 1].get("role") == "assistant":
                    pairs.append((msgs[i].get("content", ""), msgs[i + 1].get("content", "")))
        total = len(pairs)
        profile = _get_persona(username, conversation_id)
        start = profile.get("learned_turns", 0)
        new_pairs = pairs[start:]
        if not new_pairs:
            return profile
        excerpt = "\n".join(
            f"用户：{u}\nAI：{a}" for u, a in new_pairs[-40:]
        )
        learn_from_excerpt(username, excerpt, conversation_id)
        # 更新增量学习起点，避免重复提炼
        profile = _get_persona(username, conversation_id)
        profile["learned_turns"] = total
        _set_persona(username, profile, conversation_id)
    except Exception as e:
        print("【角色画像更新失败】", str(e))
    return profile


# ---- TTS (GPT-SoVITS, 需本地 9880 节点) ----
# 参考音：从「标准录音 14」截取的前 10 秒（你的声线），prompt_text 由 ARK 逐字转写得到。
REF_WAV = r"D:\Program Files\GPT-SoVITS-v2pro-20250604-nvidia50\voice.wav"
REF_PROMPT_FILE = r"D:\Program Files\GPT-SoVITS-v2pro-20250604-nvidia50\voice_prompt.txt"
SOVITS_BASE = "http://127.0.0.1:9880"

def _load_ref_prompt():
    try:
        with open(REF_PROMPT_FILE, encoding="utf-8") as f:
            t = f.read().strip()
        if t:
            return t
    except Exception:
        pass
    return "一二三四五六七八九"

def sovits_tts(text: str) -> bytes:
    prompt_text = _load_ref_prompt()
    # v2 版 API：路由 POST / ，字段 refer_wav_path / prompt_text / text / *_language
    payload_v2 = {
        "refer_wav_path": REF_WAV,
        "prompt_text": prompt_text,
        "prompt_language": "zh",
        "text": text,
        "text_language": "zh",
        "speed": 1.0,
    }
    # 兼容旧版 API：路由 POST /inference ，字段 ref_audio_path / text_lang / prompt_lang
    payload_v1 = {
        "text": text,
        "text_lang": "zh",
        "ref_audio_path": REF_WAV,
        "prompt_text": prompt_text,
        "prompt_lang": "zh",
        "speed": 1.0,
    }
    print("【发起TTS请求】refer=", REF_WAV, "prompt=", prompt_text)
    last_err = None
    for url, payload in ((SOVITS_BASE + "/", payload_v2),
                         (SOVITS_BASE + "/inference", payload_v1)):
        try:
            resp = requests.post(url, json=payload, timeout=60)
            print("【TTS返回状态码】", resp.status_code, url)
            if resp.status_code == 200:
                return resp.content
            last_err = f"{url} -> {resp.status_code}: {resp.text[:200]}"
        except Exception as e:
            last_err = f"{url} -> {e}"
            print("【sovits_tts异常】", last_err)
    raise RuntimeError("GPT-SoVITS 请求失败：" + str(last_err))


EDGE_TTS_VOICES = {
    "female": "zh-CN-XiaoxiaoNeural",
    "male": "zh-CN-YunxiNeural",
}

def edge_tts(text: str, gender: str = None) -> str:
    """使用 Edge TTS 生成语音，返回保存的文件路径"""
    try:
        import edge_tts as et
        fname = str(uuid.uuid4()) + ".mp3"
        save_path = os.path.join(TEMP_AUDIO_DIR, fname)
        voice = EDGE_TTS_VOICES.get(gender or os.environ.get("TTS_GENDER", "female"), "zh-CN-XiaoxiaoNeural")
        asyncio.run(et.Communicate(text, voice, rate="+0%", pitch="+0Hz").save(save_path))
        return f"/temp_audio/{fname}"
    except Exception as e:
        print("【Edge TTS 失败, 回退 SoVITS】", e)
        return None


# ---- 账号系统（注册 / 登录）----
def load_users():
    if not os.path.exists(USERS_FILE):
        return []
    try:
        with open(USERS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []


def save_users(users):
    with open(USERS_FILE, "w", encoding="utf-8") as f:
        json.dump(users, f, ensure_ascii=False, indent=2)


def hash_pwd(username, password):
    # bcrypt 加密存储（自动生成盐）
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def check_pwd(username, password, stored_hash):
    # 优先 bcrypt 验证，兼容旧 SHA-256
    try:
        if bcrypt.checkpw(password.encode("utf-8"), stored_hash.encode("utf-8")):
            return True
    except Exception:
        pass
    # 兼容旧版 SHA-256（以用户名为盐）
    old_hash = hashlib.sha256((password + ":" + username).encode("utf-8")).hexdigest()
    return stored_hash == old_hash


def valid_username(u):
    # 仅允许英文字母与数字
    return bool(re.fullmatch(r"[A-Za-z0-9]+", u))


def valid_password(p):
    # 至少 8 位，且同时含字母与数字
    return len(p) >= 8 and bool(re.search(r"[A-Za-z]", p)) and bool(re.search(r"\d", p))


def valid_phone(p):
    return bool(re.fullmatch(r"1[3-9]\d{9}", p))


def valid_email(e):
    return bool(re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", e))


# ---- 接口 ----
@app.route("/api/health")
def health():
    return {"status": "ok"}


@app.route("/api/announcements")
def api_announcements():
    """返回活动信息 / 更新公告列表，前端通知面板据此渲染。"""
    try:
        with open(ANNOUNCEMENTS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
        # 按 ts 倒序（最新的在前）
        data.sort(key=lambda x: x.get("ts", 0), reverse=True)
        return jsonify({"announcements": data})
    except Exception:
        return jsonify({"announcements": []})


@app.route("/api/voice", methods=["POST"])
def api_voice():
    """语音转文字：接收前端 base64 编码的 wav 音频，调用 ARK 音频理解模型返回转写文本。
    不依赖浏览器原生 Web Speech API（其识别服务在国内被墙）。"""
    if not ARK_CONFIGURED:
        return jsonify({"ok": False, "error": "ARK_API_KEY 未配置，无法使用语音识别"}), 400
    data = request.get_json(silent=True) or {}
    audio_b64 = data.get("audio_b64")
    fmt = data.get("format", "wav")
    if not audio_b64:
        return jsonify({"ok": False, "error": "未收到音频数据"}), 400
    if len(audio_b64) > 25 * 1024 * 1024:
        return jsonify({"ok": False, "error": "音频过大（上限 25MB）"}), 400
    payload = {
        "model": ASR_MODEL_ID,
        "messages": [{
            "role": "user",
            "content": [
                {"type": "input_audio", "input_audio": {"data": audio_b64, "format": fmt}},
                {"type": "text", "text": "请将这段语音内容转写为简体中文文字。只返回转写文本本身，不要加任何解释、前缀或引号。"}
            ]
        }]
    }
    headers = {
        "Authorization": f"Bearer {ARK_API_KEY}",
        "Content-Type": "application/json",
    }
    try:
        r = requests.post(ARK_URL, json=payload, headers=headers, timeout=120)
    except Exception as e:
        return jsonify({"ok": False, "error": f"调用 ARK 失败：{e}"}), 502
    if r.status_code != 200:
        msg = ""
        try:
            msg = r.json().get("error", {}).get("message", r.text[:300])
        except Exception:
            msg = r.text[:300]
        return jsonify({"ok": False, "error": f"ARK 返回错误（{r.status_code}）：{msg}"}), 502
    try:
        text = r.json()["choices"][0]["message"]["content"]
    except Exception:
        return jsonify({"ok": False, "error": "解析 ARK 返回失败"}), 502
    return jsonify({"ok": True, "text": (text or "").strip()})


def build_user_message_with_attachments(text, attachments):
    """把附件信息拼进 user 消息：文本类文件直接读取内容，其他文件仅提示文件名。"""
    if not attachments:
        return text
    parts = []
    if text:
        parts.append(text)
    for a in attachments:
        name = a.get("name", "") or "文件"
        url = a.get("url", "")
        fname = url.split("/")[-1] if url else ""
        path = os.path.join(UPLOAD_DIR, fname) if fname else ""
        ext = os.path.splitext(name)[1].lower()
        if ext in TEXT_ATTACH_EXT and path and os.path.exists(path) and os.path.getsize(path) <= TEXT_ATTACH_LIMIT:
            try:
                with open(path, "r", encoding="utf-8", errors="ignore") as fp:
                    content = fp.read()
                parts.append(f"【附件：{name}】\n{content}")
                continue
            except Exception:
                pass
        parts.append(f"（用户发送了文件：{name}）")
    return "\n\n".join(parts)


@app.route("/api/chat", methods=["POST"])
def api_chat():
    data = request.get_json()
    user_msg = data.get("message", "")
    history = data.get("history", [])
    username = (data.get("username") or "").strip()
    deep_think = data.get("deep_think", False)
    conversation_id = (data.get("conversation_id") or "").strip()
    attachments = data.get("attachments") or []

    # 未登录无法与 AI 聊天（前端也会拦截，这里做服务端兜底）
    if not username:
        return jsonify({"error": "未登录，无法聊天"}), 401

    # 人设优先取「当前对话」的 persona：先查服务端该对话，再用前端传入的 persona，最后退回全局默认
    persona = None
    if conversation_id:
        mem0 = load_user_memory(username)
        conv0 = _find_conversation(mem0, conversation_id)
        if conv0 is not None:
            persona = ensure_persona(conv0)["persona"]
    if not isinstance(persona, dict):
        persona = data.get("persona")
    if not isinstance(persona, dict):
        persona = load_character(username)
    system_text = build_system_prompt(persona)

    # 把附件内容/提示拼进当前用户消息，让文本模型也能感知到附件
    user_msg = build_user_message_with_attachments(user_msg, attachments)

    messages = []
    if system_text:
        messages.append({"role": "system", "content": system_text})
    for item in history:
        messages.append({"role": "user", "content": item[0]})
        messages.append({"role": "assistant", "content": item[1]})
    messages.append({"role": "user", "content": user_msg})
    # Qwen3 默认开启 thinking 模式会吃光 max_tokens；深度思考时保留，普通模式关闭
    if LLM_PROVIDER == "ollama" and messages and messages[-1]["role"] == "user":
        if not deep_think:
            messages[-1]["content"] += " /no_think"

    def generate():
        # 根据 LLM_PROVIDER 选择后端（默认 ARK，可选本机 Ollama）
        if LLM_PROVIDER == "ollama":
            llm_url = OLLAMA_URL
            llm_key = "ollama"          # Ollama 不校验密钥，占位即可
            # 深度思考用 8b，普通用 4b
            llm_model = OLLAMA_MODEL_DEEP if deep_think else OLLAMA_MODEL_FAST
            llm_label = f"Ollama({llm_model})"
        else:
            if not ARK_CONFIGURED:
                yield f"data:{json.dumps({'error': '后端未配置 ARK_API_KEY：请在 backend.py 第105行改为真实密钥，或设置环境变量 ARK_API_KEY 后重启后端。'}, ensure_ascii=False)}\n\n"
                return
            llm_url = ARK_URL
            llm_key = ARK_API_KEY
            llm_model = CHAT_MODEL_ID
            llm_label = "ARK"

        payload = {
            "model": llm_model,
            "messages": messages,
            "temperature": 0.8,
            "max_tokens": 2048 if deep_think else 1024,
            "stream": True,
        }
        headers = {
            "Authorization": f"Bearer {llm_key}",
            "Content-Type": "application/json",
        }

        try:
            r = requests.post(llm_url, json=payload, headers=headers, stream=True, timeout=300)
        except Exception as e:
            yield f"data:{json.dumps({'error': f'{llm_label} 请求异常：{e}'}, ensure_ascii=False)}\n\n"
            return

        if r.status_code != 200:
            err_body = r.text[:400].replace("\n", " ")
            yield f"data:{json.dumps({'error': f'{llm_label} 返回错误（HTTP {r.status_code}）：{err_body}'}, ensure_ascii=False)}\n\n"
            return

        full = ""
        try:
            for line in r.iter_lines():
                if not line:
                    continue
                text = line.decode("utf-8", errors="replace")
                if not text.startswith("data:"):
                    continue
                if "[DONE]" in text:
                    break
                raw = text[len("data:"):].strip()
                if not raw:
                    continue
                try:
                    obj = json.loads(raw)
                except Exception as e:
                    yield f"data:{json.dumps({'error': f'ARK 返回无法解析的数据：{e}；原文前200字：{raw[:200]}'}, ensure_ascii=False)}\n\n"
                    return
                if obj.get("error"):
                    err = obj["error"]
                    msg = err.get("message") if isinstance(err, dict) else str(err)
                    yield f"data:{json.dumps({'error': f'ARK 返回错误：{msg}'}, ensure_ascii=False)}\n\n"
                    return
                try:
                    token = obj["choices"][0]["delta"].get("content", "")
                except Exception as e:
                    yield f"data:{json.dumps({'error': f'ARK 返回结构异常：{e}；原文前200字：{raw[:200]}'}, ensure_ascii=False)}\n\n"
                    return
                if token:
                    full += token
                    yield f"data:{json.dumps({'text': token}, ensure_ascii=False)}\n\n"
        except Exception as e:
            yield f"data:{json.dumps({'error': f'ARK 流读取异常：{e}'}, ensure_ascii=False)}\n\n"
            return

        # ---- 解析 AI 返回的文件（格式：<<<FILE:名.后缀>>>\n内容\n<<<END>>>）----
        _file_re = re.compile(r"<<<FILE:([^>]+)>>>\s*(.*?)\s*<<<END>>>", re.DOTALL)
        gen_files = []
        for _name, _content in _file_re.findall(full):
            _name = _name.strip()
            if not _name:
                continue
            _base = re.sub(r'[^A-Za-z0-9_.-]', '_', os.path.basename(_name)) or "file"
            _stored = f"{uuid.uuid4().hex}_{safe_name(username)}_{_base}"
            _path = os.path.join(GENFILES_DIR, _stored)
            try:
                with open(_path, "w", encoding="utf-8") as _f:
                    _f.write(_content)
            except Exception as e:
                print("【AI 文件保存失败】", repr(e))
                continue
            _ext = os.path.splitext(_base)[1].lower()
            _is_text = _ext in TEXT_ATTACH_EXT
            gen_files.append({
                "name": _name,
                "url": f"/genfiles/{_stored}",
                "type": "text/plain" if _is_text else "application/octet-stream",
                "size": os.path.getsize(_path),
            })
        # 从展示文本中剥离文件块
        full = _file_re.sub("", full).strip()

        if not full and not gen_files:
            yield f"data:{json.dumps({'error': 'ARK 返回了空内容（HTTP 200 但无任何文本）。常见原因：模型接入点 ep-m-20260714044607-f5tfj 未生效/已过期，或账号余额/权限不足。请到火山引擎控制台确认接入点与密钥状态。'}, ensure_ascii=False)}\n\n"
            return

        # 若本次回复包含 AI 生成的文件，末尾补发一个 files 事件，前端据此渲染文件卡片
        if gen_files:
            yield f"data:{json.dumps({'type': 'files', 'text': full, 'files': gen_files}, ensure_ascii=False)}\n\n"

        # 自动增量学习角色画像（按对话隔离，后台不阻塞本次回复）
        try:
            mem = load_user_memory(username)
            if conversation_id:
                conv = _find_conversation(mem, conversation_id)
                if conv is not None:
                    p = ensure_persona(conv)["persona"]
                    total = count_pairs([conv])
                    if total - p.get("learned_turns", 0) >= PROFILE_THRESHOLD:
                        threading.Thread(target=update_profile, args=(username, conversation_id), daemon=True).start()
            else:
                total = count_pairs(mem.get("conversations", []))
                if total - mem["profile"].get("learned_turns", 0) >= PROFILE_THRESHOLD:
                    threading.Thread(target=update_profile, args=(username,), daemon=True).start()
        except Exception:
            pass

    return Response(
        generate(),
        mimetype="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@app.route("/api/llm-test")
def api_llm_test():
    """诊断当前 LLM 后端（ARK 或 Ollama），前端可调用查看实时状态。"""
    if LLM_PROVIDER == "ollama":
        test_payload = {
            "model": OLLAMA_MODEL,
            "messages": [{"role": "user", "content": "你好，请只回复两个字：在的 /no_think"}],
            "temperature": 0.5,
            "max_tokens": 50,
            "stream": False,
        }
        headers = {"Authorization": "Bearer ollama", "Content-Type": "application/json"}
        try:
            r = requests.post(OLLAMA_URL, json=test_payload, headers=headers, timeout=120)
            body = r.text[:800]
            try:
                obj = r.json()
                content = obj.get("choices", [{}])[0].get("message", {}).get("content", "")
            except Exception:
                content = ""
            return jsonify({
                "provider": "ollama",
                "model": OLLAMA_MODEL,
                "http_status": r.status_code,
                "reply": content,
                "raw": body,
            })
        except Exception as e:
            return jsonify({"provider": "ollama", "model": OLLAMA_MODEL, "http_status": None, "error": str(e)})
    else:
        return api_ark_test()


@app.route("/api/ark-test")
def api_ark_test():
    """诊断用：用当前 key + 模型接入点发一次非流式请求，返回真实结果。"""
    if not ARK_CONFIGURED:
        return jsonify({"configured": False, "note": "ARK_API_KEY 未配置"})
    test_payload = {
        "model": CHAT_MODEL_ID,
        "messages": [{"role": "user", "content": "你好，请只回复两个字：在的"}],
        "temperature": 0.5,
        "max_tokens": 16,
        "stream": False,
    }
    headers = {
        "Authorization": f"Bearer {ARK_API_KEY}",
        "Content-Type": "application/json",
    }
    try:
        r = requests.post(ARK_URL, json=test_payload, headers=headers, timeout=60)
        body = r.text[:800]
        try:
            obj = r.json()
            content = obj.get("choices", [{}])[0].get("message", {}).get("content", "")
        except Exception:
            content = ""
        return jsonify({
            "configured": True,
            "http_status": r.status_code,
            "model": CHAT_MODEL_ID,
            "reply": content,
            "raw": body,
        })
    except Exception as e:
        return jsonify({"configured": True, "http_status": None, "error": str(e)})


@app.route("/api/title", methods=["POST"])
def api_title():
    data = request.get_json(silent=True) or {}
    messages = data.get("messages", [])
    if not messages:
        return jsonify({"title": ""})

    convo = "\n".join(f"{m.get('role', 'user')}：{m.get('content', '')}" for m in messages)
    prompt = [
        {
            "role": "system",
            "content": (
                "你是一个对话标题生成器。请根据下面的对话内容，生成一句简洁的对话标题。"
                "要求：仅输出标题本身，中文，不超过 12 个字，不要使用引号、书名号或任何额外说明。"
            ),
        },
        {"role": "user", "content": convo},
    ]
    payload = {
        "model": CHAT_MODEL_ID,
        "messages": prompt,
        "temperature": 0.3,
        "max_tokens": 24,
        "stream": True,
    }
    headers = {
        "Authorization": f"Bearer {ARK_API_KEY}",
        "Content-Type": "application/json",
    }

    def try_generate():
        # 使用流式读取并拼接，避免整段响应读超时（与 /api/chat 一致）
        r = requests.post(ARK_URL, json=payload, headers=headers, stream=True, timeout=90)
        full = ""
        for line in r.iter_lines():
            if not line:
                continue
            text = line.decode("utf-8")
            if not text.startswith("data:"):
                continue
            if "[DONE]" in text:
                break
            try:
                obj = json.loads(text.replace("data:", ""))
                token = obj["choices"][0]["delta"].get("content", "")
                if token:
                    full += token
            except Exception:
                continue
        return full.strip().strip("\"'「」『』《》【】()（） ").strip()

    title = ""
    for attempt in range(2):  # 失败重试一次
        try:
            title = try_generate()
            if title:
                break
        except Exception as e:
            print(f"【标题生成失败·第{attempt + 1}次】", str(e))

    if not title or len(title) > 24:
        title = ""
    return jsonify({"title": title})


@app.route("/api/character", methods=["GET", "POST"])
def api_character():
    if request.method == "GET":
        username = request.args.get("username", "").strip()
        conversation_id = request.args.get("conversation_id", "").strip()
        if not username:
            return jsonify({
                "logged_in": False,
                "name": "小诺", "base_setting": "", "learned": "",
                "learned_turns": 0, "total_turns": 0, "pending": 0,
                "threshold": PROFILE_THRESHOLD,
                "persona_key": "", "persona_title": "",
            })
        mem = load_user_memory(username)
        if conversation_id:
            conv = _find_conversation(mem, conversation_id)
            if conv is None:
                return jsonify({"logged_in": True, "not_found": True,
                                "name": "小诺", "base_setting": "", "learned": "",
                                "learned_turns": 0, "total_turns": 0, "pending": 0,
                                "threshold": PROFILE_THRESHOLD, "bot_avatar": None,
                                "persona_key": "", "persona_title": ""})
            profile = ensure_persona(conv)["persona"]
            convs_for_count = [conv]
        else:
            profile = mem["profile"]
            convs_for_count = mem.get("conversations", [])
        total = count_pairs(convs_for_count)
        pending = max(0, total - profile.get("learned_turns", 0))
        return jsonify({
            "logged_in": True,
            "name": profile.get("name", "小诺"),
            "base_setting": profile.get("base_setting", ""),
            "learned": profile.get("learned", ""),
            "learned_turns": profile.get("learned_turns", 0),
            "total_turns": total,
            "pending": pending,
            "threshold": PROFILE_THRESHOLD,
            "bot_avatar": profile.get("bot_avatar", None),
            "persona_key": profile.get("persona_key", ""),
            "persona_title": profile.get("persona_title", ""),
        })

    # POST：保存角色初始设定（name / base_setting），可选 reset_learned / reset_all 清空人设
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    if not username:
        return jsonify({"ok": False, "msg": "未登录"}), 400
    conversation_id = (data.get("conversation_id") or "").strip()
    if conversation_id:
        mem = load_user_memory(username)
        conv = _find_conversation(mem, conversation_id)
        if conv is None:
            return jsonify({"ok": False, "msg": "对话不存在"}), 404
        profile = ensure_persona(conv)["persona"]
    else:
        profile = load_user_profile(username)
    name = (data.get("name") or "").strip()
    base_setting = data.get("base_setting")
    if name:
        profile["name"] = name
    if base_setting is not None:
        profile["base_setting"] = str(base_setting).strip()
    if data.get("reset_learned"):
        profile["learned"] = ""
        profile["learned_turns"] = 0
    if data.get("reset_bot_avatar"):
        profile.pop("bot_avatar", None)
    if data.get("reset_all"):
        # 全部回到出厂默认：清空已学人设、初始设定、名字、头像
        profile["name"] = "小诺"
        profile["base_setting"] = ""
        profile["learned"] = ""
        profile["learned_turns"] = 0
        profile["updated_at"] = 0
        profile.pop("bot_avatar", None)
    if conversation_id:
        save_user_memory(username, mem)
    else:
        save_user_profile(username, profile)
    return jsonify({"ok": True, "profile": profile})


@app.route("/api/character/learn", methods=["POST"])
def api_character_learn():
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    if not username:
        return jsonify({"ok": False, "msg": "未登录"}), 400
    conversation_id = (data.get("conversation_id") or "").strip()
    # 后台学习，立即返回当前待学习轮次
    threading.Thread(target=update_profile, args=(username, conversation_id), daemon=True).start()
    if conversation_id:
        conv = _find_conversation(load_user_memory(username), conversation_id)
        pending = max(0, count_pairs([conv]) - ensure_persona(conv)["persona"].get("learned_turns", 0)) if conv else 0
    else:
        pending = max(0, count_pairs(load_user_memory(username).get("conversations", []))
                       - load_user_profile(username).get("learned_turns", 0))
    return jsonify({"ok": True, "pending": pending})


@app.route("/api/character/learn-file", methods=["POST"])
def api_character_learn_file():
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    content = (data.get("content") or "").strip()
    conversation_id = (data.get("conversation_id") or "").strip()
    if not username:
        return jsonify({"ok": False, "msg": "未登录"}), 401
    if not content:
        return jsonify({"ok": False, "msg": "文件内容为空"}), 400
    try:
        learn_from_excerpt(username, content, conversation_id)  # 同步：调用即等模型提炼完成并写回
    except Exception as e:
        print("【从文件学习失败】", repr(e))
    return jsonify({"ok": True})


@app.route("/api/bot/avatar", methods=["POST"])
def api_bot_avatar():
    # 上传机器人自定义头像
    username = (request.form.get("username") or "").strip()
    if not username:
        return jsonify({"ok": False, "msg": "未登录"}), 400
    conversation_id = (request.form.get("conversation_id") or "").strip()
    f = request.files.get("file")
    if not f or not f.filename:
        return jsonify({"ok": False, "msg": "请选择图片"}), 400
    ext = os.path.splitext(f.filename)[1].lower()
    if ext not in ALLOWED_AVATAR_EXT:
        return jsonify({"ok": False, "msg": "不支持的图片格式"}), 400
    safe = safe_name(username)
    filename = safe + ext
    filepath = os.path.join(BOT_AVATAR_DIR, filename)
    f.save(filepath)
    avatar_url = f"/bot_avatars/{filename}"
    if conversation_id:
        mem = load_user_memory(username)
        conv = _find_conversation(mem, conversation_id)
        if conv is not None:
            ensure_persona(conv)["persona"]["bot_avatar"] = avatar_url
            save_user_memory(username, mem)
        else:
            profile = load_user_profile(username)
            profile["bot_avatar"] = avatar_url
            save_user_profile(username, profile)
    else:
        profile = load_user_profile(username)
        profile["bot_avatar"] = avatar_url
        save_user_profile(username, profile)
    return jsonify({"ok": True, "avatar": avatar_url})


@app.route("/api/memory", methods=["GET", "POST"])
def api_memory():
    # 账号专属记忆库：task_count(对话任务个数) / conversations(聊天内容) / profile(AI 训练成果)
    if request.method == "GET":
        username = request.args.get("username", "").strip()
        if not username:
            return jsonify({"logged_in": False, "task_count": 0,
                            "conversations": [], "profile": None})
        mem = load_user_memory(username)
        return jsonify({
            "logged_in": True,
            "task_count": mem["task_count"],
            "conversations": mem["conversations"],
            "profile": mem["profile"],
        })

    # POST：前端把当前会话数组同步进该账号记忆库（对话内容）
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    if not username:
        return jsonify({"ok": False, "msg": "未登录"}), 400
    patch = {}
    if "conversations" in data:
        convs = data["conversations"]
        if isinstance(convs, list):
            for c in convs:
                ensure_persona(c)  # 兼容旧前端：保证每条对话带 persona
        patch["conversations"] = convs
    if "profile" in data:
        patch["profile"] = data["profile"]
    if patch:
        update_user_memory(username, patch)
    return jsonify({"ok": True})


@app.route("/api/register", methods=["POST"])
def api_register():
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    email = (data.get("email") or "").strip()
    phone = (data.get("phone") or "").strip()
    password = data.get("password") or ""

    if not valid_username(username):
        return jsonify({"ok": False, "msg": "用户名只能包含英文字母和数字"}), 400
    if not valid_password(password):
        return jsonify({"ok": False, "msg": "密码至少 8 位，且同时包含字母和数字"}), 400
    if not valid_phone(phone):
        return jsonify({"ok": False, "msg": "请输入正确的 11 位手机号"}), 400
    if not valid_email(email):
        return jsonify({"ok": False, "msg": "邮箱格式不正确"}), 400

    users = load_users()
    if any(u["username"].lower() == username.lower() for u in users):
        return jsonify({"ok": False, "msg": "该用户名已被注册"}), 400
    if any(u.get("email", "").lower() == email.lower() for u in users):
        return jsonify({"ok": False, "msg": "该邮箱已被注册"}), 400
    if any(u.get("phone") == phone for u in users):
        return jsonify({"ok": False, "msg": "该手机号已被注册"}), 400

    users.append({
        "username": username,
        "email": email,
        "phone": phone,
        "password": hash_pwd(username, password),
        "created_at": int(time.time()),
    })
    save_users(users)
    return jsonify({"ok": True, "username": username})


@app.route("/api/login", methods=["POST"])
def api_login():
    data = request.get_json(silent=True) or {}
    account = (data.get("account") or "").strip()
    password = data.get("password") or ""

    users = load_users()
    # 系统里没有任何注册用户 → 直接引导去注册页
    if not users:
        return jsonify({"needRegister": True})

    user = None
    for u in users:
        if u["username"].lower() == account.lower() \
                or u.get("email", "").lower() == account.lower() \
                or u.get("phone") == account:
            user = u
            break

    if not user:
        return jsonify({"ok": False, "msg": "账号不存在，请先注册"})
    if not check_pwd(user["username"], password, user["password"]):
        return jsonify({"ok": False, "msg": "密码错误"})
    # 如果旧 SHA-256 登录成功，升级为 bcrypt
    if not user["password"].startswith("$2b$"):
        user["password"] = hash_pwd(user["username"], password)
        save_users(users)
    return jsonify({"ok": True, "username": user["username"], "avatar": user.get("avatar")})


def _find_user(users, username):
    return next((u for u in users if u["username"].lower() == username.lower()), None)


@app.route("/api/user/avatar", methods=["POST"])
def api_user_avatar():
    # 更换头像：需密码重校验，保存图片并更新用户头像路径
    username = (request.form.get("username") or "").strip()
    password = request.form.get("password") or ""
    f = request.files.get("file")
    if not username or not password or not f:
        return jsonify({"ok": False, "msg": "缺少参数"}), 400
    users = load_users()
    # api_user_avatar: 验证密码
    user = _find_user(users, username)
    if not user:
        return jsonify({"ok": False, "msg": "账号不存在"}), 404
    if not check_pwd(user["username"], password, user["password"]):
        return jsonify({"ok": False, "msg": "密码错误"}), 401

    ext = os.path.splitext(f.filename or "")[1].lower()
    if ext not in ALLOWED_AVATAR_EXT:
        return jsonify({"ok": False, "msg": "仅支持 jpg / png / gif / webp 图片"}), 400
    raw = f.read()
    if len(raw) > 3 * 1024 * 1024:
        return jsonify({"ok": False, "msg": "图片过大（上限 3MB）"}), 400
    if not raw:
        return jsonify({"ok": False, "msg": "图片内容为空"}), 400

    fname = uuid.uuid4().hex + ext
    with open(os.path.join(AVATAR_DIR, fname), "wb") as fp:
        fp.write(raw)
    user["avatar"] = "/avatars/" + fname
    save_users(users)
    return jsonify({"ok": True, "avatar": user["avatar"]})


@app.route("/api/user/password", methods=["POST"])
def api_user_password():
    # 修改密码：校验原密码，新密码需满足规则
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    old_pwd = data.get("old_password") or ""
    new_pwd = data.get("new_password") or ""
    users = load_users()
    user = _find_user(users, username)
    if not user:
        return jsonify({"ok": False, "msg": "账号不存在"}), 404
    # api_change_pwd: 验证旧密码
    if not check_pwd(user["username"], old_pwd, user["password"]):
        return jsonify({"ok": False, "msg": "原密码错误"}), 401
    if not valid_password(new_pwd):
        return jsonify({"ok": False, "msg": "新密码至少 8 位，且同时包含字母和数字"}), 400
    user["password"] = hash_pwd(user["username"], new_pwd)
    save_users(users)
    return jsonify({"ok": True})


@app.route("/api/forgot/reset", methods=["POST"])
def api_forgot_reset():
    # 忘记密码（无登录态）：账号 + 注册邮箱 双重校验后重置密码
    # 说明：当前环境无 SMTP / 短信通道，无法发送验证码，故以「注册邮箱」作为身份校验
    data = request.get_json(silent=True) or {}
    account = (data.get("account") or "").strip()
    email = (data.get("email") or "").strip()
    new_pwd = data.get("new_password") or ""
    confirm = data.get("confirm_password") or ""

    if not account:
        return jsonify({"ok": False, "msg": "请输入账号"}), 400
    if not valid_email(email):
        return jsonify({"ok": False, "msg": "请输入注册时使用的邮箱"}), 400
    if not valid_password(new_pwd):
        return jsonify({"ok": False, "msg": "新密码至少 8 位，且同时包含字母和数字"}), 400
    if new_pwd != confirm:
        return jsonify({"ok": False, "msg": "两次密码不一致"}), 400

    users = load_users()
    user = None
    for u in users:
        if u["username"].lower() == account.lower() \
                or u.get("email", "").lower() == account.lower() \
                or u.get("phone") == account:
            user = u
            break
    if not user:
        return jsonify({"ok": False, "msg": "账号不存在，请先注册"}), 400
    if user.get("email", "").lower() != email.lower():
        return jsonify({"ok": False, "msg": "邮箱与该账号不匹配"}), 400

    user["password"] = hash_pwd(user["username"], new_pwd)
    save_users(users)
    return jsonify({"ok": True, "msg": "密码已重置，请用新密码登录"})


@app.route("/api/user/delete", methods=["POST"])
def api_user_delete():
    # 注销账号：需密码确认，删除该用户
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""
    users = load_users()
    user = _find_user(users, username)
    if not user:
        return jsonify({"ok": False, "msg": "账号不存在"}), 404
    # api_delete_account: 验证密码
    if not check_pwd(user["username"], password, user["password"]):
        return jsonify({"ok": False, "msg": "密码错误"}), 401
    # 删除该用户头像文件（如有自定义头像）
    avatar = user.get("avatar", "")
    if avatar and avatar.startswith("/avatars/"):
        try:
            fname = os.path.basename(avatar)
            fpath = os.path.join(AVATAR_DIR, fname)
            if os.path.exists(fpath):
                os.remove(fpath)
        except Exception:
            pass
    # 删除该账号的专属记忆库（对话内容 / AI 训练成果随之消失）
    try:
        delete_user_memory(username)
    except Exception:
        pass
    users = [u for u in users if u["username"].lower() != username.lower()]
    save_users(users)
    return jsonify({"ok": True})


@app.route("/api/tts", methods=["POST"])
def api_tts():
    data = request.get_json()
    text = data.get("text", "")
    if not text:
        return jsonify({"error": "缺少文本"}), 400
    try:
        gender = data.get("gender", os.environ.get("TTS_GENDER", "female"))
        url = edge_tts(text, gender)
        if url:
            return jsonify({"url": url})
        return jsonify({"error": "Edge TTS 不可用"}), 503
    except Exception as e:
        print("TTS合成失败：", str(e))
        return jsonify({"error": "语音合成失败"}), 500


@app.route("/temp_audio/<filename>")
def serve_audio(filename):
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else "wav"
    mime = {"wav": "audio/wav", "mp3": "audio/mpeg", "ogg": "audio/ogg"}.get(ext, "audio/wav")
    return send_from_directory(TEMP_AUDIO_DIR, filename, mimetype=mime)


@app.route("/avatars/<filename>")
def serve_avatar(filename):
    return send_from_directory(AVATAR_DIR, filename)


@app.route("/bot_avatars/<filename>")
def bot_avatar_file(filename):
    return send_from_directory(BOT_AVATAR_DIR, filename)


@app.route("/uploads/<filename>")
def serve_upload(filename):
    return send_from_directory(UPLOAD_DIR, filename)


@app.route("/api/upload", methods=["POST"])
def api_upload():
    """接收聊天附件（multipart 多文件），按 用户_随机_原名 存储，返回可访问的元数据。"""
    username = (request.form.get("username") or "").strip()
    if not username:
        return jsonify({"ok": False, "msg": "未登录"}), 400
    files = request.files.getlist("file")
    if not files:
        return jsonify({"ok": False, "msg": "未选择文件"}), 400
    results = []
    for f in files:
        if not f or not f.filename:
            continue
        ext = os.path.splitext(f.filename)[1].lower()
        base = re.sub(r'[^A-Za-z0-9_.-]', '_', os.path.basename(f.filename)) or "file"
        stored = f"{safe_name(username)}_{uuid.uuid4().hex[:8]}_{base}"
        path = os.path.join(UPLOAD_DIR, stored)
        try:
            f.save(path)
        except Exception as e:
            print("【附件保存失败】", repr(e))
            continue
        results.append({
            "name": f.filename,
            "url": f"/uploads/{stored}",
            "type": f.content_type or "application/octet-stream",
            "size": os.path.getsize(path),
        })
    return jsonify({"ok": True, "files": results})


# ---- 静态资源 ----
@app.route("/")
def index():
    # 根路径直接进入首页
    return redirect("/home/", code=302)


@app.route("/chat/")
def chat_page():
    return send_from_directory(BASE_DIR, "index.html")


@app.route("/chat/<path:filename>")
def chat_static(filename):
    return send_from_directory(BASE_DIR, filename)


@app.route("/style.css")
def css():
    return send_from_directory(BASE_DIR, "style.css")


@app.route("/app.js")
def js():
    return send_from_directory(BASE_DIR, "app.js")


# 对话页自身的静态资源（如默认头像 nova-hero.jpg）
@app.route("/files/<path:filename>")
def web_files(filename):
    return send_from_directory(BASE_DIR, filename)

# AI 生成/返回的文件（由 /api/chat 解析落盘到 GENFILES_DIR）
@app.route("/genfiles/<filename>")
def gen_files_route(filename):
    return send_from_directory(GENFILES_DIR, filename)


# ---- 登录 / 注册页（auth）与主页（home）托管，统一走 7860 ----
# 无结尾斜杠的路径重定向到带斜杠版本，保证页面内的相对资源（style.css/app.js/图片）
# 在经后端托管时也能正确解析到 /auth/、/home/ 下，而不是被根路由抢走。
@app.route("/auth")
def auth_redirect():
    return redirect("/auth/", code=301)


@app.route("/auth/")
def auth_page():
    return send_from_directory(AUTH_DIR, "index.html")


@app.route("/auth/<path:filename>")
def auth_static(filename):
    return send_from_directory(AUTH_DIR, filename)


@app.route("/home")
def home_redirect():
    return redirect("/home/", code=301)


@app.route("/home/")
def home_page():
    return send_from_directory(HOME_DIR, "index.html")


@app.route("/home/<path:filename>")
def home_static(filename):
    return send_from_directory(HOME_DIR, filename)


# ---- 启动时清理过期音频 ----
def clean_audio():
    expire = 3 * 3600
    now = time.time()
    for f in os.listdir(TEMP_AUDIO_DIR):
        fp = os.path.join(TEMP_AUDIO_DIR, f)
        if os.path.isfile(fp) and now - os.path.getmtime(fp) > expire:
            try:
                os.remove(fp)
            except Exception:
                pass


clean_audio()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=7860, debug=False, threaded=True)
