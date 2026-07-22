import os
import sys
import io
import uuid
import requests
import time
import hashlib
import json
import hmac
import base64
from flask import Flask, request, jsonify, send_file
from flask import Flask, request, jsonify, render_template_string
from flask import send_file
http_session = requests.Session()

def sovits_tts(text: str) -> bytes:
    url = "http://127.0.0.1:9880/tts"
    payload = {
        "text": text,
        "text_lang": "zh",
        "ref_audio_path": r"E:\Program Files\GPT-SoVITS-v2pro-20250604-nvidia50\voice.wav",
        "prompt_text": "大家好，这是我的声音样本，用来训练ai音色，请清晰收录我的声线特征，谢谢。",
        "prompt_lang": "zh",
        "speed": 1.0,
        "top_k": 12,
        "top_p": 0.65,
        "temperature": 0.5
    }
    print("【发起TTS请求】url=", url, "payload=", payload)
    try:
        resp = requests.post(url, json=payload, timeout=120)
        print("【TTS返回状态码】", resp.status_code)
        if resp.status_code != 200:
            print("【TTS错误详情】", resp.text)
        resp.raise_for_status()
        return resp.content
    except Exception as e:
        print("【TTS接口异常】", str(e))
        raise e

# # 记忆文件路径
MEMORY_FILE = "chat_memory.json"

# 初始化记忆文件，如果不存在就创建空文件
def init_memory_file():
    if not os.path.exists(MEMORY_FILE):
        with open(MEMORY_FILE, "w", encoding="utf-8") as f:
            json.dump([], f, ensure_ascii=False, indent=2)

# 读取全部历史记忆
def load_memory():
    init_memory_file()
    with open(MEMORY_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

# 保存一轮对话记忆
def save_memory(user_text, bot_text):
    memory = load_memory()
    memory.append({"user": user_text, "bot": bot_text})
    with open(MEMORY_FILE, "w", encoding="utf-8") as f:
        json.dump(memory, f, ensure_ascii=False, indent=2)

# ===================== 方舟大模型配置 =====================
ARK_API_KEY = "YOUR_ARK_API_KEY"
CHAT_MODEL_ID = "ep-m-20260714044607-f5tfj"

app = Flask(__name__)

SYSTEM_PROMPT = """
认真学习下面提供的历史聊天对话，模仿对话双方的语气、说话习惯、常用称呼进行交流。
不要主动复述历史记录，自然聊天。
当用户消息以「画图：」开头时，提示绘图功能暂未启用，其余场景正常文字对话。
"""

def load_chat_history():
    try:
        with open("chat_history.txt", "r", encoding="utf-8") as f:
            content = f.read()
        return f"【历史聊天样本】\n{content}"
    except Exception:
        return "暂无聊天记录"

history_content = load_chat_history()

# 大模型对话接口
# 大模型对话接口（接入长期记忆chat_memory.json）
@app.route("/api/chat", methods=["POST"])
def api_chat():
    data = request.get_json()
    user_msg = data.get("message", "")
    session_history = data.get("history", [])

    if user_msg.startswith("画图："):
        return jsonify({"reply": "绘图功能暂未配置部署ID"})

    # 读取长期记忆，最多读取最近15条，防止上下文超限
    all_memory = load_memory()[-15:]

    # 拼接记忆内容
    memory_text = "【你和用户的过往全部聊天记录，请记住用户的信息、喜好、习惯，自然交流，不要主动复述历史】\n"
    for item in all_memory:
        memory_text += f"用户：{item['user']}\n你：{item['bot']}\n"

    full_system = SYSTEM_PROMPT + "\n" + history_content + "\n" + memory_text
    messages = [{"role": "system", "content": full_system}]

    # 本次会话临时上下文
    for u, a in session_history:
        messages.append({"role": "user", "content": u})
        messages.append({"role": "assistant", "content": a})
    messages.append({"role": "user", "content": user_msg})

    headers = {
        "Authorization": f"Bearer {ARK_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": CHAT_MODEL_ID,
        "messages": messages,
        "temperature": 0.8
    }
    resp = requests.post("https://ark.cn-beijing.volces.com/api/v3/chat/completions",
                         json=payload, headers=headers, timeout=60)
    res_json = resp.json()
    if "error" in res_json:
        return jsonify({"reply": f"模型报错：{res_json['error'].get('message')}"})
    reply_text = res_json["choices"][0]["message"]["content"]

    # 保存本轮问答至长期记忆文件
    save_memory(user_msg, reply_text)
    session_history.append([user_msg, reply_text])
    return jsonify({"reply": reply_text})

# 获取当前脚本所在目录
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEMP_AUDIO_DIR = os.path.join(BASE_DIR, "temp_audio")
os.makedirs(TEMP_AUDIO_DIR, exist_ok=True)



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
        print("语音合成失败：", str(e))
        return jsonify({"error": "语音合成失败"}), 500

@app.route("/temp_audio/<filename>")
def serve_temp_audio(filename):
    file_path = os.path.join(TEMP_AUDIO_DIR, filename)
    return send_file(file_path, mimetype="audio/wav")

# -------- 自动清理临时音频（删除3小时前的文件） --------
def clean_old_audio():
    expire_sec = 3 * 60 * 60  # 3小时过期
    now = time.time()
    if not os.path.exists(TEMP_AUDIO_DIR):
        return
    for fname in os.listdir(TEMP_AUDIO_DIR):
        fpath = os.path.join(TEMP_AUDIO_DIR, fname)
        if os.path.isfile(fpath):
            mtime = os.path.getmtime(fpath)
            if now - mtime > expire_sec:
                try:
                    os.remove(fpath)
                except Exception as e:
                    print("清理文件失败：", fpath, e)

# 在服务启动前执行一次清理
clean_old_audio()

# 前端网页
HTML_PAGE = """
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<title>AI聊天（复刻你的声音）</title>
<style>
body{max-width:700px;margin:20px auto;padding:0 15px;font-family:system-ui}
.chat-box{
    height:600px;
    overflow-y:auto;border:1px solid #ddd;
    padding:10px;margin-bottom:10px}
.msg-user{text-align:right;margin:8px 0}
.msg-bot{text-align:left;margin:8px 0}
.msg-content{display:inline-block;padding:8px 12px;border-radius:8px;max-width:80%}
.msg-user .msg-content{background:#409EFF;color:#fff}
.msg-bot .msg-content{background:#eee;color:#222}
.audio-btn{margin-left:8px;padding:4px 8px;font-size:12px;cursor:pointer}
.input-area{display:flex;gap:8px}
textarea{flex:1;padding:8px;height:60px}
button{padding:0 16px;cursor:pointer}
.loading-spinner {
    width: 22px;
    height: 22px;
    border: 3px solid #dddddd;
    border-top-color: #4285f4;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    display: inline-block;
}
@keyframes spin {
    to { transform: rotate(360deg); }
}
</style>
</head>
<body>
<h2>专属聊天（语音为你的复刻声线）</h2>
<div class="chat-box" id="chatbox"></div>
<div class="input-area">
<textarea id="msg" placeholder="正常聊天；画图：描述画面"></textarea>
<button onclick="sendMsg()">发送</button>
</div>
<script>
let history = [];
window._voice_cache = {};
window.audio_url_cache = {};
window.pendingTTS = {};
window.currentAudio = null;
window.currentBtn = null;

// ⏱️ 模拟音频加载50%触发打字的延时（毫秒，根据体验微调，推荐1200~1800）
const SIM_HALF_DELAY = 1500;

async function getAudioUrl(text) {
    if (window.audio_url_cache[text]) {
        return window.audio_url_cache[text];
    }
    if (window.pendingTTS[text]) {
        return await window.pendingTTS[text];
    }

    const task = fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text })
    })
    .then(resp => resp.json())
    .then(json => {
        if (!json.url) throw new Error("后端未返回音频url");
        window.audio_url_cache[text] = json.url;
        return json.url;
    });

    window.pendingTTS[text] = task;
    try {
        return await task;
    } finally {
        delete window.pendingTTS[text];
    }
}

async function playVoice(uid, btnElem) {
    const text = window._voice_cache[uid];
    let audioUrl;
    try {
        audioUrl = await getAudioUrl(text);
    } catch (e) {
        console.error("获取音频失败：", e);
        alert("语音获取失败");
        return;
    }

    // 同一条消息：播放/暂停切换
    if (window.currentAudio && window.currentAudio.dataset.audioUrl === audioUrl) {
        if (window.currentAudio.paused) {
            window.currentAudio.play();
            btnElem.innerText = "暂停语音";
        } else {
            window.currentAudio.pause();
            btnElem.innerText = "播放语音";
        }
        return;
    }

    // 切换消息，停止正在播放音频
    if (window.currentAudio) {
        window.currentAudio.pause();
        window.currentAudio = null;
        if(window.currentBtn){
            window.currentBtn.innerText = "播放语音";
        }
    }

    const audio = new Audio(audioUrl);
    audio.volume = 0.9;
    audio.dataset.audioUrl = audioUrl;
    window.currentAudio = audio;
    window.currentBtn = btnElem;
    btnElem.innerText = "暂停语音";

    audio.onended = () => {
        btnElem.innerText = "播放语音";
        window.currentAudio = null;
        window.currentBtn = null;
    };

    audio.play().catch(err => {
        console.log("播放拦截：", err);
        alert("浏览器限制音频，请再次点击");
        btnElem.innerText = "播放语音";
        window.currentAudio = null;
        window.currentBtn = null;
    });
}

async function typeWriter(element, fullText, speed = 60) {
    element.innerText = "";
    for (let i = 0; i < fullText.length; i++) {
        element.innerText += fullText[i];
        const chatBox = document.getElementById("chatbox");
        chatBox.scrollTop = chatBox.scrollHeight;
        await new Promise(r => setTimeout(r, speed));
    }
}

function addMsg(role, content) {
    const box = document.getElementById("chatbox");
    const div = document.createElement("div");
    div.className = "msg-" + role;
    if (role === "bot") {
        const uid = Date.now();
        // 初始：仅加载动画，无播放按钮
        div.innerHTML = `<span class="msg-content"><span class="loading-spinner"></span></span>`;
        window._voice_cache[uid] = content;
        box.appendChild(div);
        box.scrollTop = box.scrollHeight;
        const textSpan = div.querySelector(".msg-content");
        let typingStarted = false;

        // 并行启动TTS请求
        const audioPromise = getAudioUrl(content);

        // 模拟延时到达，启动打字
        setTimeout(()=>{
            typingStarted = true;
            typeWriter(textSpan, content, 60);
        }, SIM_HALF_DELAY);

        // TTS全部生成完成：移除加载动画，创建播放按钮
        audioPromise
        .then(()=>{
            // 如果打字还没启动（极端情况TTS极快），先执行打字
            if(!typingStarted){
                typingStarted = true;
                typeWriter(textSpan, content, 60);
            }
            // 移除加载圆圈
            textSpan.innerHTML = content;
            // 创建播放按钮
            const btn = document.createElement("button");
            btn.className = "audio-btn";
            btn.innerText = "播放语音";
            btn.onclick = function(){
                playVoice(uid, this);
            };
            div.appendChild(btn);
        })
        .catch(err => {
            console.log("音频生成失败", err);
            if(!typingStarted){
                typingStarted = true;
                typeWriter(textSpan, content, 100);
            }
            textSpan.innerHTML = content;
        });
    } else {
        div.innerHTML = `<div class="msg-content">${content}</div>`;
        box.appendChild(div);
        box.scrollTop = box.scrollHeight;
    }
}

async function sendMsg() {
    const msgInput = document.getElementById("msg");
    const text = msgInput.value.trim();
    if (!text) return;
    addMsg("user", text);
    msgInput.value = "";

    // ✅【关键改动】先立刻创建bot气泡（出现加载转圈）
    const placeholderBotDiv = createEmptyBotMessage();

    try {
        const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: text, history: history })
        });
        const data = await res.json();
        history.push([text, data.reply]);
        // 移除临时占位气泡，正式渲染完整bot消息
        placeholderBotDiv.remove();
        addMsg("bot", data.reply);
    } catch (err) {
        placeholderBotDiv.remove();
        addMsg("bot", "请求出错，无法获取回复！");
    }
}

// 新增：只创建带加载动画的空白bot气泡（没有任何文字、没有按钮）
function createEmptyBotMessage() {
    const box = document.getElementById("chatbox");
    const div = document.createElement("div");
    div.className = "msg-bot";
    div.innerHTML = `<span class="msg-content"><span class="loading-spinner"></span></span>`;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
    return div;
}
</script>
</body>
</html>
"""
@app.route("/")
def index():
    return render_template_string(HTML_PAGE)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=7860, debug=False)