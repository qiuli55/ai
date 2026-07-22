import soundfile as sf

# 换成你的wav路径
wav_path = "test-output.wav"
data, samplerate = sf.read(wav_path)

print(f"采样率：{samplerate}")
print(f"形状(样本数,声道)：{data.shape}")

if samplerate == 24000:
    print("✅ 采样率符合ChatTTS标准24000")
else:
    print("❌ 采样率不对，需要24000")

# 判断单声道
if len(data.shape) == 1:
    print("✅ 单声道，正常")
else:
    print("❌ 多声道，需要转为单声道")