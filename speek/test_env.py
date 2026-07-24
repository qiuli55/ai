import os, sys
print("Python version:", sys.version)
print("Current dir:", os.getcwd())
print("Python exe:", sys.executable)

# Check if key files exist
files_to_check = [
    r"D:\Program Files\GPT-SoVITS-v2pro-20250604-nvidia50\runtime\python.exe",
    r"D:\Program Files\GPT-SoVITS-v2pro-20250604-nvidia50\api.py",
    r"D:\Program Files\GPT-SoVITS-v2pro-20250604-nvidia50\GPT_SoVITS\pretrained_models\s1v3.ckpt",
    r"E:\编程\我的ai(网页版)\speek\train_data\myvoice\SoVITS_weights\myvoice_e20_s2360.pth",
    r"E:\编程\我的ai(网页版)\speek\train_data\myvoice\wavs\clip007.wav",
]
for f in files_to_check:
    print(f"  {f}: EXISTS={os.path.exists(f)}")

print("ENV PATH:", os.environ.get("PATH", "NOT SET"))
print("Done!")
