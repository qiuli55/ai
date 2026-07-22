from flask import Flask, request, jsonify, render_template_string

# =========配置==========
ARK_API_KEY = "YOUR_ARK_API_KEY"
CHAT_MODEL_ID = "ep-doubao-seed-2-1-pro-260628"
IMAGE_MODEL_ID = "doubao-seedream-5-0-pro-260628"
# ======================

app = Flask(__name__)

SYSTEM_PROMPT = """
学习附带的历史聊天记录，模仿双方语气、称呼、说话习惯交流。
不要主动复述历史记录，自然聊天。
用户以「画图：」开头，则生成图片。
"""

# 读取聊天记录
def load_history():
    try:
        with open("chat_history.txt","r",encoding="utf-8") as f:
            content = f.read()
        return f"【历史聊天样本】\n{content}"
    except:
        return "暂无聊天记录"
history_data = load_history()

# 网络函数【仅在调用时动态导入requests】
def ai_request(messages):
    import requests
    headers = {
        "Authorization": f"Bearer {ARK_API_KEY}",
        "Content-Type":"application/json"
    }
    payload = {
        "model":CHAT_MODEL_ID,
        "messages":messages,
        "temperature":0.8
    }
    resp = requests.post("https://ark.cn-beijing.volces.com/api/v3/chat/completions",
                         json=payload,timeout=60)
    return resp.json()["choices"][0]["message"]["content"]

def draw_pic(prompt):
    import requests
    headers = {
        "Authorization": f"Bearer {ARK_API_KEY}",
        "Content-Type":"application/json"
    }
    payload = {
        "model":IMAGE_MODEL_ID,
        "prompt":prompt,
        "size":"2k",
        "watermark":False
    }
    resp = requests.post("https://ark.cn-beijing.volces.com/api/v3/images/generations",
                         json=payload,timeout=120)
    return resp.json()["data"][0]["url"]


@app.route("/api/chat",methods=["POST"])
def api_chat():
    data = request.get_json()
    user_msg = data["message"]
    history = data["history"]

    if user_msg.startswith("画图："):
        try:
            url = draw_pic(user_msg.replace("画图：","").strip())
            return jsonify({"reply":f"✨![图片]({url})"})
        except Exception as e:
            return jsonify({"reply":f"绘图失败：{str(e)}"})

    messages = [{"role":"system","content":SYSTEM_PROMPT + "\n" + history_data}]
    for u,a in history:
        messages.append({"role":"user","content":u})
        messages.append({"role":"assistant","content":a})
    messages.append({"role":"user","content":user_msg})
    reply = ai_request(messages)
    return jsonify({"reply":reply})


HTML = """
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>专属AI聊天</title>
<style>
body{max-width:720px;margin:20px auto;padding:0 16px;font-family:微软雅黑}
.box{height:620px;border:1px solid #ddd;padding:12px;overflow-y:auto;margin-bottom:12px}
.user{text-align:right;margin:8px 0}
.bot{text-align:left;margin:8px 0}
.msg{display:inline-block;padding:8px 12px;border-radius:10px;max-width:80%}
.user .msg{background:#4285f4;color:#fff}
.bot .msg{background:#eeeeee;color:#222}
.area{display:flex;gap:8px}
textarea{flex:1;height:64px;padding:8px}
button{padding:0 18px;cursor:pointer}
img{max-width:320px;border-radius:6px}
</style>
</head>
<body>
<h2>AI聊天窗口</h2>
<div class="box" id="chatbox"></div>
<div class="area">
<textarea id="msg" placeholder="正常聊天；画图：描述画面"></textarea>
<button onclick="send()">发送</button>
</div>
<script>
const box = document.getElementById("chatbox");
const input = document.getElementById("msg");
let history = [];

function add(role,text){
    let div = document.createElement("div");
    div.className = role;
    let html = text;
    const reg = /!\[.*?\]\((.*?)\)/;
    if(reg.test(text)){
        let imgSrc = text.match(reg)[1];
        html = `<img src="${imgSrc}">`;
    }
    div.innerHTML = `<div class="msg">${html}</div>`;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
}

async function send(){
    let text = input.value.trim();
    if(!text) return;
    add("user",text);
    input.value = "";
    let res = await fetch("/api/chat",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({message:text,history:history})
    });
    let data = await res.json();
    add("bot",data.reply);
    history.push([text,data.reply]);
}
</script>
</body>
</html>
"""

@app.route("/")
def index():
    return render_template_string(HTML)

if __name__ == "__main__":
    print("✅ 服务启动成功！浏览器打开：http://127.0.0.1:7860")
    app.run(host="0.0.0.0",port=7860,debug=False)