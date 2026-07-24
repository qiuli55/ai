"""GPT-SoVITS 测试音频生成脚本
前提：api.py 服务已在 9880 端口上运行
"""
import requests, os

text = "你好，这是demucs降噪版的声音测试。"
ref_wav = r"E:\编程\我的ai(网页版)\speek\train_data\myvoice\wavs\clip007.wav"
prompt_text = "放门口了,大宝呢,放学了吗?"

payload = {
    "refer_wav_path": ref_wav,
    "prompt_text": prompt_text,
    "text": text,
    "text_language": "zh",
    "noise_scale": 0.9,
    "noise_scale_w": 0.5,
}

print(f"发送请求到 http://localhost:9880/ ...")
print(f"  参考音频: {ref_wav}")
print(f"  参考文本: {prompt_text}")
print(f"  生成文本: {text}")

resp = requests.post("http://localhost:9880/", json=payload, timeout=120)
if resp.status_code == 200:
    out = r"E:\编程\我的ai(网页版)\speek\train_data\V1_demucs_test.wav"
    with open(out, "wb") as f:
        f.write(resp.content)
    print(f"OK: saved {len(resp.content)} bytes to {out}")
else:
    print(f"FAIL: {resp.status_code} {resp.text[:500]}")
