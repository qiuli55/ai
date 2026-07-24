@echo off
set PATH=D:\Program Files\GPT-SoVITS-v2pro-20250604-nvidia50\runtime;C:\Windows\system32;C:\Windows;C:\Windows\System32\Wbem
set SYSTEMROOT=C:\Windows
set USERPROFILE=C:\Users\Administrator
set HOME=C:\Users\Administrator
set TEMP=C:\Users\Administrator\AppData\Local\Temp
set CUDA_VISIBLE_DEVICES=0
set PYTHONPATH=D:\Program Files\GPT-SoVITS-v2pro-20250604-nvidia50\GPT_SoVITS
set is_half=True
cd /d "D:\Program Files\GPT-SoVITS-v2pro-20250604-nvidia50\GPT_SoVITS"
"D:\Program Files\GPT-SoVITS-v2pro-20250604-nvidia50\runtime\python.exe" "D:\Program Files\GPT-SoVITS-v2pro-20250604-nvidia50\api.py" -s "E:\编程\我的ai(网页版)\speek\train_data\myvoice\SoVITS_weights\myvoice_e20_s2360.pth" -g "D:\Program Files\GPT-SoVITS-v2pro-20250604-nvidia50\GPT_SoVITS\pretrained_models\s1v3.ckpt" -dr "E:\编程\我的ai(网页版)\speek\train_data\myvoice\wavs\clip007.wav" -dt "放门口了,大宝呢,放学了吗?" -dl "zh"
