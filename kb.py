"""
NOVA 项目知识库 - 自动同步项目文件到 Ollama
用法:
  python kb.py "你的问题"           # 带项目文件上下文提问
  python kb.py --watch              # 监听模式，文件变了自动更新
  python kb.py --update             # 手动同步项目文件到知识库
"""
import sys, os, json, time, hashlib, glob
import requests

PROJECT = r"E:\编程\我的ai(网页版)"
OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "qwen2.5-coder:7b"

# 要跟踪的项目文件
WATCH_FILES = [
    "homepage/index.html", "homepage/style.css", "homepage/app.js",
    "auth/index.html", "auth/style.css", "auth/app.js",
    "speek/index.html", "speek/style.css", "speek/app.js",
    "speek/backend.py",
]

def build_context(files=None):
    """读取指定文件，构建上下文。files=None 则读全部"""
    targets = files if files else WATCH_FILES
    ctx = "# NOVA Project Knowledge Base\n\n"
    files_loaded = []
    for rel in targets:
        fp = os.path.join(PROJECT, rel.replace("/", "\\"))
        if os.path.exists(fp):
            with open(fp, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
            ctx += f"## File: {rel}\n```\n{content}\n```\n\n"
            files_loaded.append(rel)
    
    ctx += f"\n# Files loaded: {len(files_loaded)}\n"
    return ctx, files_loaded

def check_updates():
    """检查文件是否有更新"""
    changes = []
    cache = {}
    if os.path.exists(CACHE_FILE):
        with open(CACHE_FILE, "r") as f:
            cache = json.load(f)
    
    for rel in WATCH_FILES:
        fp = os.path.join(PROJECT, rel.replace("/", "\\"))
        new_hash = get_file_hash(fp)
        old_hash = cache.get(rel)
        if new_hash and new_hash != old_hash:
            changes.append(rel)
        cache[rel] = new_hash
    
    # 保存缓存
    with open(CACHE_FILE, "w") as f:
        json.dump(cache, f)
    
    return changes

def ask_ollama(context, question):
    """带上下文问模型"""
    prompt = f"{context}\n\nUser question: {question}\n\n请基于以上项目文件回答。"
    resp = requests.post(OLLAMA_URL, json={
        "model": MODEL,
        "prompt": prompt,
        "stream": False,
        "options": {"num_predict": 8192}
    }, timeout=180)
    return resp.json().get("response", "[No response]")

def watch_mode():
    """监听模式"""
    print(">>> NOVA Knowledge Base Watcher")
    print(f"    Watching {len(WATCH_FILES)} files\n")
    
    # 首次构建
    check_updates()
    print(f"    Initial file cache built\n")
    print("    Press Ctrl+C to stop\n")
    
    while True:
        time.sleep(3)
        changes = check_updates()
        if changes:
            print(f"[{time.strftime('%H:%M:%S')}] Files changed:")
            for f in changes:
                print(f"  - {f}")
            print("  Knowledge base ready for next query\n")

def update_mode():
    """手动更新缓存"""
    changes = check_updates()
    if changes:
        print("Updated files:")
        for f in changes:
            print(f"  - {f}")
    else:
        print("All files are up to date")
    print(f"Total: {len(WATCH_FILES)} files tracked")

if __name__ == "__main__":
    args = sys.argv[1:]
    
    if "--watch" in args:
        watch_mode()
    elif "--update" in args:
        update_mode()
    else:
        # 支持 --files 指定文件列表，例如: --files speek/app.js,speek/index.html
        specific = None
        if "--files" in args:
            idx = args.index("--files")
            if idx + 1 < len(args):
                specific = [f.strip() for f in args[idx + 1].split(",")]
            args = [a for a in args if not a.startswith("--files")][:idx]
        
        question = " ".join(args) or "介绍这个项目"
        print("[Loading project files...]")
        ctx, files = build_context(specific)
        print(f"[Loaded {len(files)} files]")
        print(f"[Asking {MODEL}...]")
        answer = ask_ollama(ctx, question)
        print(f"\n{'='*60}")
        print(answer)
