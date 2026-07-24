import os, sys
output_file = r"E:\编程\我的ai(网页版)\speek\test_env_result.txt"
with open(output_file, "w", encoding="utf-8") as f:
    f.write(f"Python version: {sys.version}\n")
    f.write(f"Current dir: {os.getcwd()}\n")
    f.write(f"Python exe: {sys.executable}\n")
    files_to_check = [
        r"D:\Program Files\GPT-SoVITS-v2pro-20250604-nvidia50\runtime\python.exe",
        r"D:\Program Files\GPT-SoVITS-v2pro-20250604-nvidia50\api.py",
        r"D:\Program Files\GPT-SoVITS-v2pro-20250604-nvidia50\GPT_SoVITS\pretrained_models\s1v3.ckpt",
        r"E:\编程\我的ai(网页版)\speek\train_data\myvoice\SoVITS_weights\myvoice_e20_s2360.pth",
        r"E:\编程\我的ai(网页版)\speek\train_data\myvoice\wavs\clip007.wav",
    ]
    for p in files_to_check:
        f.write(f"  {p}: EXISTS={os.path.exists(p)}\n")
    f.write(f"ENV PATH: {os.environ.get('PATH', 'NOT SET')}\n")
    f.write("Done!\n")
