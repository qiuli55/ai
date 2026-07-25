import subprocess, os

PY = r"C:\Users\Administrator\.workbuddy\binaries\python\envs\default\Scripts\python.exe"
SCRIPT = r"E:\编程\我的ai(网页版)\speek\backend.py"
LOG = r"E:\speek_run.log"

with open(LOG, "w", encoding="utf-8") as f:
    subprocess.Popen(
        [PY, SCRIPT],
        cwd=os.path.dirname(SCRIPT),
        stdout=f,
        stderr=subprocess.STDOUT,
        creationflags=subprocess.DETACHED_PROCESS | subprocess.CREATE_NEW_PROCESS_GROUP,
        close_fds=True,
    )
print("launched backend (detached)")
