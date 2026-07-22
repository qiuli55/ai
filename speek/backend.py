import os
import re
import time
import json
import uuid
import hashlib
import threading
import shutil
import requests
from flask import Flask, request, jsonify, send_from_directory, Response, redirect

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
ALLOWED_AVATAR_EXT = {".jpg", ".jpeg", ".png", ".gif", ".webp"}

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

ARK_API_KEY = "YOUR_ARK_API_KEY"
CHAT_MODEL_ID = "ep-m-20260714044607-f5tfj"
ARK_URL = "https://ark.cn-beijing.volces.com/api/v3/chat/completions"

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


def learn_from_excerpt(username, excerpt_raw):
    """把一段对话文本（excerpt）提炼/合并进该账号的角色人设（AI 训练成果）。"""
    try:
        excerpt = (excerpt_raw or "")[:12000]
        if not excerpt.strip():
            return
        profile = load_user_profile(username)
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
            save_user_profile(username, profile)
            print(f"【角色画像已更新·{username}】from file/context")
    except Exception as e:
        print("【角色画像(文件)更新失败】", str(e))


def update_profile(username):
    """从指定账号的记忆库对话中提炼/合并角色人设并持久化。"""
    try:
        mem = load_user_memory(username)
        profile = mem["profile"]
        conversations = mem.get("conversations", [])
        pairs = []
        for c in conversations:
            msgs = c.get("messages", [])
            for i in range(len(msgs) - 1):
                if msgs[i].get("role") == "user" and msgs[i + 1].get("role") == "assistant":
                    pairs.append((msgs[i].get("content", ""), msgs[i + 1].get("content", "")))
        total = len(pairs)
        start = profile.get("learned_turns", 0)
        new_pairs = pairs[start:]
        if not new_pairs:
            return profile
        excerpt = "\n".join(
            f"用户：{u}\nAI：{a}" for u, a in new_pairs[-40:]
        )
        learn_from_excerpt(username, excerpt)
        # 更新增量学习起点，避免重复提炼
        profile = load_user_profile(username)
        profile["learned_turns"] = total
        save_user_profile(username, profile)
    except Exception as e:
        print("【角色画像更新失败】", str(e))
    return profile


# ---- TTS (GPT-SoVITS, 需本地 9880 节点) ----
def sovits_tts(text: str) -> bytes:
    url = "http://127.0.0.1:9880/inference"
    payload = {
        "text": text,
        "text_lang": "zh",
        "ref_audio_path": r"E:\Program Files\GPT-SoVITS-v2pro-20250604-nvidia50\voice.wav",
        "prompt_text": "这里替换成你参考音频原话",
        "prompt_lang": "zh",
        "speed": 1.0,
    }
    print("【发起TTS请求】url=", url)
    try:
        resp = requests.post(url, json=payload, timeout=60)
        print("【TTS返回状态码】", resp.status_code)
        resp.raise_for_status()
        return resp.content
    except Exception as e:
        print("【sovits_tts内部异常】", str(e))
        raise e


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
    # 以用户名为盐，SHA-256 存储，避免明文
    return hashlib.sha256((password + ":" + username).encode("utf-8")).hexdigest()


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


@app.route("/api/chat", methods=["POST"])
def api_chat():
    data = request.get_json()
    user_msg = data.get("message", "")
    history = data.get("history", [])
    username = (data.get("username") or "").strip()

    # 未登录无法与 AI 聊天（前端也会拦截，这里做服务端兜底）
    if not username:
        return jsonify({"error": "未登录，无法聊天"}), 401

    profile = load_character(username)
    system_text = build_system_prompt(profile)

    messages = []
    if system_text:
        messages.append({"role": "system", "content": system_text})
    for item in history:
        messages.append({"role": "user", "content": item[0]})
        messages.append({"role": "assistant", "content": item[1]})
    messages.append({"role": "user", "content": user_msg})

    def generate():
        payload = {
            "model": CHAT_MODEL_ID,
            "messages": messages,
            "temperature": 0.8,
            "max_tokens": 1024,
            "stream": True,
        }
        headers = {
            "Authorization": f"Bearer {ARK_API_KEY}",
            "Content-Type": "application/json",
        }

        r = requests.post(ARK_URL, json=payload, headers=headers, stream=True)
        full = ""

        for line in r.iter_lines():
            if line:
                text = line.decode("utf-8")
                if text.startswith("data:"):
                    if "[DONE]" in text:
                        break
                    obj = json.loads(text.replace("data:", ""))
                    token = obj["choices"][0]["delta"].get("content", "")
                    if token:
                        full += token
                        yield f"data:{json.dumps({'text': token}, ensure_ascii=False)}\n\n"

        # 自动增量学习角色画像（按账号隔离，后台不阻塞本次回复）
        try:
            mem = load_user_memory(username)
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
        if not username:
            return jsonify({
                "logged_in": False,
                "name": "小诺", "base_setting": "", "learned": "",
                "learned_turns": 0, "total_turns": 0, "pending": 0,
                "threshold": PROFILE_THRESHOLD,
            })
        mem = load_user_memory(username)
        profile = mem["profile"]
        convs = mem.get("conversations", [])
        total = count_pairs(convs)
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
        })

    # POST：保存角色初始设定（name / base_setting），可选 reset_learned 清空已学人设
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    if not username:
        return jsonify({"ok": False, "msg": "未登录"}), 400
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
    save_user_profile(username, profile)
    return jsonify({"ok": True, "profile": profile})


@app.route("/api/character/learn", methods=["POST"])
def api_character_learn():
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    if not username:
        return jsonify({"ok": False, "msg": "未登录"}), 400
    # 后台学习，立即返回当前待学习轮次
    threading.Thread(target=update_profile, args=(username,), daemon=True).start()
    pending = max(0, count_pairs(load_user_memory(username).get("conversations", []))
                   - load_user_profile(username).get("learned_turns", 0))
    return jsonify({"ok": True, "pending": pending})


@app.route("/api/character/learn-file", methods=["POST"])
def api_character_learn_file():
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    content = (data.get("content") or "").strip()
    if not username:
        return jsonify({"ok": False, "msg": "未登录"}), 401
    if not content:
        return jsonify({"ok": False, "msg": "文件内容为空"}), 400
    try:
        learn_from_excerpt(username, content)  # 同步：调用即等模型提炼完成并写回
    except Exception as e:
        print("【从文件学习失败】", repr(e))
    return jsonify({"ok": True})


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
        patch["conversations"] = data["conversations"]
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
    if user["password"] != hash_pwd(user["username"], password):
        return jsonify({"ok": False, "msg": "密码错误"})
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
    user = _find_user(users, username)
    if not user:
        return jsonify({"ok": False, "msg": "账号不存在"}), 404
    if user["password"] != hash_pwd(user["username"], password):
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
    if user["password"] != hash_pwd(user["username"], old_pwd):
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
    if user["password"] != hash_pwd(user["username"], password):
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
        wav_bytes = sovits_tts(text)
        fname = str(uuid.uuid4()) + ".wav"
        save_path = os.path.join(TEMP_AUDIO_DIR, fname)
        with open(save_path, "wb") as f:
            f.write(wav_bytes)
        return jsonify({"url": f"/temp_audio/{fname}"})
    except Exception as e:
        print("TTS合成失败：", str(e))
        return jsonify({"error": "语音合成失败"}), 500


@app.route("/temp_audio/<filename>")
def serve_audio(filename):
    return send_from_directory(TEMP_AUDIO_DIR, filename, mimetype="audio/wav")


@app.route("/avatars/<filename>")
def serve_avatar(filename):
    return send_from_directory(AVATAR_DIR, filename)


# ---- 静态资源 ----
@app.route("/")
def index():
    return send_from_directory(BASE_DIR, "index.html")


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
