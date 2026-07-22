import requests

# ========= 这里改成你新版控制台最新创建的ARK密钥 =========
ARK_API_KEY = "YOUR_ARK_API_KEY"
CHAT_MODEL_ID = "ep-m-20260714044607-f5tfj"

headers = {
    "Authorization": f"Bearer {ARK_API_KEY}",
    "Content-Type": "application/json"
}
payload = {
    "model": CHAT_MODEL_ID,
    "messages": [{"role": "user", "content": "你好"}]
}
url = "https://ark.cn-beijing.volces.com/api/v3/chat/completions"

resp = requests.post(url, headers=headers, json=payload, timeout=60)
print("返回结果：")
print(resp.json())