from volcengine.visual.VisualService import VisualService
import json

# ========== 填入你的信息 ==========
AK = "YOUR_ACCESS_KEY"
SK = "YOUR_SECRET_KEY"
APP_ID = "091f3a01-3bda-4d56-bf70-08b0faef31e7"
SPEAKER_ID = "S_NEPBAaQ82"
text_content = "测试语音合成效果"

visual_service = VisualService()
visual_service.set_ak(AK)
visual_service.set_sk(SK)

body = {
    "app": {
        "appid": APP_ID,
        "cluster": "volc_tts"
    },
    "user": {
        "uid": "local_test"
    },
    "audio": {
        "audio_format": "mp3",
        "speed_ratio": 1.0
    },
    "request": {
        "text": text_content,
        "text_type": "plain",
        "speaker": SPEAKER_ID,
        "speaker_type": "clone"
    }
}
resp = visual_service.tts(json.dumps(body))

if resp.status_code == 200:
    with open("output_sdk.mp3", "wb") as f:
        f.write(resp.content)
    print("✅ 生成成功 output_sdk.mp3")
else:
    print("❌ 失败", resp.text)