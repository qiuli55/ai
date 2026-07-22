import torch
import librosa
import sys
from pathlib import Path

# 获取当前脚本目录
base_dir = Path(__file__).parent
sys.path.insert(0, str(base_dir))

# 直接导入
from chattts.core import Chat

def main():
    model_root = str(base_dir / "chatts")
    tts = Chat()
    load_ok = tts.load(source="local", custom_path=model_root)

    if not load_ok:
        raise Exception("❌ 模型加载失败，请检查 chatts/asset 所有权重完整！")

    audio_path = r"E:\编程\我的ai(网页版)\voice.wav"
    audio, sr = librosa.load(audio_path, sr=24000)
    audio_tensor = torch.from_numpy(audio).unsqueeze(0)

    # 先注释掉提取emb代码，先测试模型能不能正常加载！
    # with torch.no_grad():
    #     spk_emb = tts._spk_encoder(audio_tensor)
    # torch.save(spk_emb, r"E:\编程\我的ai(网页版)\my_voice_emb.pt")
    print("✅ 模型加载成功！")

if __name__ == "__main__":
    main()