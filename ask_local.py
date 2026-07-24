"""
NOVA 本地助手 v2 - 读取 & 修改项目文件
用法:
  python ask_local.py "你的问题"           # 只读模式：问答
  python ask_local.py --write "修改首页"    # 写模式：生成修改方案并写文件
  python ask_local.py --dry-run "删除..."   # 预览模式：只看不改
"""
import sys, os, json, glob, difflib
import requests

PROJECT = r"E:\编程\我的ai(网页版)"

# ========== 文件清单 ==========
KEY_FILES = [
    "homepage/index.html", "homepage/style.css", "homepage/app.js",
    "speek/backend.py",
    "auth/index.html", "auth/app.js", "auth/style.css",
    "speek/index.html", "speek/app.js", "speek/style.css",
]

# ========== 读项目文件 ==========
def read_project_files(question, max_per_file=4000):
    context = f"# 项目: NOVA AI 助手\n路径: {PROJECT}\n\n"
    for rel in KEY_FILES:
        fp = os.path.join(PROJECT, rel.replace("/", "\\"))
        if os.path.exists(fp):
            with open(fp, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
            context += f"\n## 文件: {rel}\n```\n{content[:max_per_file]}\n```\n"
    context += f"\n## 用户需求\n{question}\n"
    return context


def read_specific_files(file_list, max_per_file=6000):
    """只读指定的文件列表（写模式用）"""
    context = ""
    for rel in file_list:
        fp = os.path.join(PROJECT, rel.replace("/", "\\"))
        if os.path.exists(fp):
            with open(fp, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
            context += f"\n## 文件: {rel}\n```\n{content[:max_per_file]}\n```\n"
    return context


# ========== 调本地模型 ==========
def ask_ollama(prompt, model="qwen2.5-coder:7b", max_tokens=8192):
    # 添加中文系统提示
    full_prompt = "请用中文回答。\n\n" + prompt if not prompt.startswith("请用中文回答") else prompt
    resp = requests.post("http://localhost:11434/api/generate", json={
        "model": model,
        "prompt": full_prompt,
        "stream": False,
        "options": {"num_predict": max_tokens}
    }, timeout=180)
    return resp.json().get("response", "无回复")


# ========== 写模式：让模型生成修改方案 ==========
def generate_edit_plan(question):
    """让模型分析问题，输出需要修改哪些文件"""
    # 先读整个项目概况
    overview = read_project_files(question, max_per_file=2000)

    plan_prompt = overview + """

---
基于上述项目结构和用户需求，请分析需要**修改哪些文件**。
只输出一个 JSON 数组，格式如下，不要其他文字：
[
  {"file": "相对路径", "reason": "为什么改这个文件"},
  {"file": "相对路径", "reason": "..."}
]

如果不需要修改任何文件，输出空数组 []。
"""
    plan_text = ask_ollama(plan_prompt, max_tokens=2048)
    try:
        # 尝试从回复中提取 JSON
        plan_text_clean = plan_text.strip()
        if "```json" in plan_text_clean:
            plan_text_clean = plan_text_clean.split("```json")[1].split("```")[0].strip()
        elif "```" in plan_text_clean:
            plan_text_clean = plan_text_clean.split("```")[1].split("```")[0].strip()
        plan = json.loads(plan_text_clean)
        return plan
    except:
        print("[!] 模型返回格式异常，尝试直接全文修改")
        return [{"file": f, "reason": "模型建议修改"} for f in KEY_FILES[:3]]


def apply_edit(file_rel, new_content):
    """将新内容写入文件（先备份）"""
    fp = os.path.join(PROJECT, file_rel.replace("/", "\\"))
    backup = fp + ".bak"
    if os.path.exists(fp):
        # 备份
        with open(fp, "r", encoding="utf-8") as f:
            old = f.read()
        with open(backup, "w", encoding="utf-8") as f:
            f.write(old)
        # 写新内容
        with open(fp, "w", encoding="utf-8") as f:
            f.write(new_content)
        # 显示 diff
        diff = difflib.unified_diff(
            old.splitlines(keepends=True),
            new_content.splitlines(keepends=True),
            fromfile=f"{file_rel} (旧)",
            tofile=f"{file_rel} (新)",
        )
        diff_text = "".join(diff)
        return True, diff_text
    else:
        # 新文件
        with open(fp, "w", encoding="utf-8") as f:
            f.write(new_content)
        return True, f"[新文件] {fp}"


def write_mode(question, dry_run=False):
    """写模式主流程"""
    print(f"\n[分析] 确定需要修改的文件...\n")
    plan = generate_edit_plan(question)

    if not plan:
        print("[!] 模型认为不需要修改文件")
        return

    print(f"  需要修改 {len(plan)} 个文件：")
    for p in plan:
        print(f"    · {p['file']} — {p['reason']}")

    # 读取这些文件的当前内容
    file_list = [p["file"] for p in plan]
    context = read_specific_files(file_list)

    write_prompt = context + f"""

---
用户需求: {question}

请根据上述文件内容，生成修改后的完整文件内容。
**只输出 JSON**，格式如下，不要任何额外的文字、markdown 或注释：

[
  {{
    "file": "相对路径",
    "new_content": "修改后的完整文件内容（保留所有原有代码，只修改需要改的部分）"
  }}
]

⚠️ 每条 new_content 必须是**该文件的完整内容**，不能省略任何已有代码。
"""
    print(f"\n[思考] qwen2.5-coder 正在生成修改方案...\n")
    response = ask_ollama(write_prompt, max_tokens=16384)

    # 解析 JSON
    try:
        text = response.strip()
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()
        edits = json.loads(text)
    except:
        print("[!] 模型输出格式异常，原始回复如下：")
        print(response[:2000])
        return

    if dry_run:
        print(f"\n{'='*60}")
        print(f"[预览模式] 以下为将要执行的修改：")
        print(f"{'='*60}")
        for edit in edits:
            print(f"\n--- {edit['file']} ---")
            print(f"内容长度: {len(edit.get('new_content', ''))} 字符")
            print(f"前 200 字: {edit.get('new_content', '')[:200]}...")
        print(f"\n[预览结束] 使用 --write 实际写入")
        return

    # 逐个写入
    for edit in edits:
        file_rel = edit["file"]
        new_content = edit.get("new_content", "")
        if not new_content:
            print(f"[跳过] {file_rel}: 内容为空")
            continue
        ok, diff = apply_edit(file_rel, new_content)
        if ok:
            print(f"\n✅ {file_rel} 已更新（旧文件已备份为 .bak）")
            # 显示 diff 摘要（只显示前 30 行）
            lines = diff.split("\n")
            if len(lines) > 35:
                print("   diff 摘要 (前30行):")
                print("\n".join(lines[:30]))
                print(f"   ... 共 {len(lines)} 行变更")
            else:
                print("   diff:")
                print(diff)
        else:
            print(f"❌ {file_rel} 写入失败")
    print(f"\n🎉 全部完成！")


# ========== 主入口 ==========
if __name__ == "__main__":
    args = sys.argv[1:]

    if not args:
        print(__doc__)
        sys.exit(0)

    dry_run = "--dry-run" in args
    write = "--write" in args or "-w" in args

    # 过滤掉标记参数，剩下的就是问题
    question = " ".join(a for a in args if not a.startswith("--") and a != "-w")

    if write or dry_run:
        write_mode(question, dry_run=dry_run)
    else:
        print(f"[读取项目文件...]")
        prompt = read_project_files(question)
        print(f"[调用 qwen2.5-coder:7b...]")
        answer = ask_ollama(prompt)
        print(f"\n{'='*60}")
        print(answer)
