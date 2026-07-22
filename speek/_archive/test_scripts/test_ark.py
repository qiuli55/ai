import requests

# 直接填入你的密钥
ARK_API_KEY = "YOUR_ARK_API_KEY"
CHAT_MODEL_ID = "ep-doubao-seed-2-1-pro-260628"

headers = {
    "Authorization": f"Bearer {ARK_API_KEY}",
    "Content-Type": "application/json"
}

payload = {
    "model": CHAT_MODEL_ID,
    "messages": [
        {"role": "user", "content": "你好"}
    ]
}

url = "https://ark.cn-beijing.volces.com/api/v3/chat/completions"
resp = requests.post(url, headers=headers, json=payload, timeout=60)
print("状态码：", resp.status_code)
print("返回内容：", resp.json())