from flask import Flask, request, jsonify, render_template_string
from volcenginesdkarkruntime import Ark
import requests

# ========== 有效配置（来自quick_test验证通过） ==========
ARK_API_KEY = "YOUR_ARK_API_KEY"
CHAT_MODEL_ID = "ep-m-20260714044607-f5tfj"
IMAGE_MODEL_ID = ""

# ======================================================

app = Flask(__name__)

# 初始化方舟客户端
client = Ark(
    api_key=ARK_API_KEY,
    base_url="https://ark.cn-beijing.volces.com/api/v3"
)

SYSTEM_PROMPT = """
认真学习下面提供的历史聊天对话，模仿对话双方的语气、说话习惯、常用称呼进行交流。
不要主动复述历史记录，自然聊天。
当用户消息以「画图：」开头时，执行文生图，其余场景正常文字对话。
"""

# 加载聊天记录
def load_chat_history():
    try:
        with open("chat_history.txt", "r", encoding="utf-8") as f:
            content = f.read()
        return f"【历史聊天样本】\n{content}"
    except Exception as e:
        print("读取聊天记录失败：", str(e))
        return "暂无聊天记录"

history_content = load_chat_history()

# AI对话接口
@app.route("/api/chat", methods=["POST"])
def api_chat():
    data = request.get_json()
    user_msg = data.get("message","")
    history = data.get("history", [])

    if user_msg.startswith("画图："):
        return jsonify({"reply": "绘图功能暂未配置部署ID"})

    messages = [{"role":"system","content": SYSTEM_PROMPT + "\n" + history_content}]
    for u, a in history:
        messages.append({"role":"user","content":u})
        messages.append({"role":"assistant","content":a})
    messages.append({"role":"user","content":user_msg})

    try:
        completion = client.chat.completions.create(
            model=CHAT_MODEL_ID,
            messages=messages,
            temperature=0.8
        )
        reply_text = completion.choices[0].message.content
        return jsonify({"reply": reply_text})
    except Exception as err:
        return jsonify({"reply": f"接口报错：{str(err)}"})

# 前端页面
HTML_PAGE = """
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<title>AI聊天</title>
<style>
body{max-width:700px;margin:20px auto;padding:0 15px;font-family:system-ui}
.chat-box{height:600px;overflow-y:auto;border:1px solid #ddd;padding:10px;margin-bottom:10px}
.msg-user{text-align:right;margin:8px 0}
.msg-bot{text-align:left;margin:8px 0}
.msg-content{display:inline-block;padding:8px 12px;border-radius:8px;max-width:80%}
.msg-user .msg-content{background:#409EFF;color:#fff}
.msg-bot .msg-content{background:#eee;color:#222}
.input-area{display:flex;gap:8px}
textarea{flex:1;padding:8px;height:60px}
button{padding:0 16px;cursor:pointer}
img{max-width:300px;border-radius:4px;}
</style>
</head>
<body>
<h2>专属聊天</h2>
<div class="chat-box" id="chatbox"></div>
<div class="input-area">
<textarea id="msg" placeholder="正常聊天；画图：描述画面"></textarea>
<button onclick="sendMsg()">发送</button>
</div>
<script>
const chatbox = document.getElementById("chatbox");
const msgInput = document.getElementById("msg");
let history = [];

function addMsg(role, text){
    const div = document.createElement("div");
    div.className = role === "user" ? "msg-user" : "msg-bot";
    let html = text;
    if(text.includes("![图片](")){
        const match = text.match(/!\[.*?\]\((.*?)\)/);
        if(match){
            html = `<img src="${match[1]}">`;
        }
    }
    div.innerHTML = `<div class="msg-content">${html}</div>`;
    chatbox.appendChild(div);
    chatbox.scrollTop = chatbox.scrollHeight;
}

async function sendMsg(){
    const text = msgInput.value.trim();
    if(!text) return;
    addMsg("user", text);
    msgInput.value = "";
    const res = await fetch("/api/chat",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({message:text, history:history})
    });
    const data = await res.json();
    addMsg("bot", data.reply);
    history.push([text, data.reply]);
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