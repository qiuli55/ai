import torch
import librosa
from chattts.core import Chat

# 初始化模型，路径和你项目匹配
tts = Chat()
load_ok = tts.load(
    source="local",
    custom_path=r"E:\编程\我的ai(网页版)\chattts"
)
if not load_ok:
    raise Exception("ChatTTS模型加载失败")

# 你的人声文件
audio_path = r"E:\编程\我的ai(网页版)\voice.wav"

audio, sr = librosa.load(audio_path, sr=24000)
audio_tensor = torch.from_numpy(audio).unsqueeze(0)

# 提取音色特征
spk_emb = tts.extract_spk_emb(audio_tensor)

# 保存音色文件到当前文件夹
torch.save(spk_emb, r"E:\编程\我的ai(网页版)\my_voice_emb.pt")
print("✅ 音色提取完成，生成文件：my_voice_emb.pt")