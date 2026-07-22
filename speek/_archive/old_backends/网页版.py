import gradio as gr
import requests

# ========== 填入你的配置 ==========
ARK_API_KEY = "YOUR_ARK_API_KEY"
CHAT_MODEL_ID = "ep-doubao-seed-2-1-pro-260628"
IMAGE_MODEL_ID = "doubao-seedream-5-0-pro-260628"
# =================================

# AI人设
SYSTEM_PROMPT = """认真学习下面提供的历史聊天对话，模仿对话双方的语气、说话习惯、常用称呼进行交流。
不要主动复述历史记录，自然聊天。
如果用户消息以【画图：】开头，识别绘图指令，正常对话不要生成图片。
"""
# 自动加载聊天记录
def load_chat_history():
    try:
        with open("chat_history.txt", "r", encoding="utf-8") as f:
            content = f.read()
        return f"【历史聊天记录样本】\n{content}"
    except FileNotFoundError:
        return "警告：未找到chat_history.txt文件，不会加载历史对话样本"

history_text = load_chat_history()

def draw_image(prompt):
    url = "https://ark.cn-beijing.volces.com/api/v3/images/generations"
    headers = {
        "Authorization": f"Bearer {ARK_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": IMAGE_MODEL_ID,
        "prompt": prompt,
        "size": "2k",
        "watermark": False
    }
    resp = requests.post(url, json=payload, timeout=120)
    data = resp.json()
    img_url = data["data"][0]["url"]
    return img_url
    

def chat_response(message, history):
    # 判断绘图指令
    if message.startswith("画图："):
        prompt = message.replace("画图：", "").strip()
        try:
            img_link = draw_image(prompt)
            return f"收到✨\n![生成图片]({img_link})"
        except Exception as err:
            return f"绘图失败：{str(err)}"

    # 文字对话
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT + "\n" + history_text}
    ]
    # 追加历史对话
    for user_msg, bot_msg in history:
        messages.append({"role": "user", "content": user_msg})
        messages.append({"role": "assistant", "content": bot_msg})
    messages.append({"role": "user", "content": message})

    url = "https://ark.cn-beijing.volces.com/api/v3/chat/completions"
    headers = {
        "Authorization": f"Bearer {ARK_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": CHAT_MODEL_ID,
        "messages": messages,
        "temperature": 0.8
    }
    try:
        resp = requests.post(url, json=payload, timeout=60)
        res_json = resp.json()
        # 打印完整返回内容，调试用
        print("API原始返回：", res_json)
        reply = res_json["choices"][0]["message"]["content"]
        return reply
    except Exception as e:
        return f"接口调用出错！详情：{str(e)}"
# 网页界面
demo = gr.ChatInterface(
    fn=chat_response,
    title="专属AI聊天",
    description="直接正常聊天；想要绘图请输入【画图：画面描述】",
    examples=[
        "在干嘛呀",
        "今天有点不开心",
        "画图：傍晚海边落日，温柔治愈画风"
    ]
)

if __name__ == "__main__":
    demo.launch(server_name="127.0.0.1", server_port=7860, share=False)