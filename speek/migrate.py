#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""将 speek 现有 JSON 数据迁移到 MySQL。

用法（在 speek/ 目录下，用 default 环境 python 运行）：
  python migrate.py

会自动：执行 create_tables.sql 建表 -> 备份原 JSON 到 backup_json_时间戳/ -> 迁移
users / announcements / character_profile / 每个账号的 memory(对话+人设+profile)。
"""
import os
import json
import time
import shutil
import pymysql
from pymysql.cursors import DictCursor

BASE_DIR = os.path.abspath(os.path.dirname(__file__))


def load_local_env():
    for _cand in (BASE_DIR, os.path.dirname(BASE_DIR)):
        p = os.path.join(_cand, ".env")
        if os.path.exists(p):
            with open(p, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        os.environ.setdefault(k.strip(), v.strip())
            break


load_local_env()

DB_HOST = os.environ.get("DB_HOST", "127.0.0.1")
DB_PORT = int(os.environ.get("DB_PORT", "3306"))
DB_USER = os.environ.get("DB_USER", "speek")
DB_PASSWORD = os.environ.get("DB_PASSWORD", "")
DB_NAME = os.environ.get("DB_NAME", "speek")


def get_db():
    return pymysql.connect(host=DB_HOST, port=DB_PORT, user=DB_USER,
                           password=DB_PASSWORD, database=DB_NAME,
                           charset="utf8mb4", cursorclass=DictCursor)


def get_user_id(db, username):
    with db.cursor() as c:
        c.execute("SELECT id FROM users WHERE username=%s", (username,))
        row = c.fetchone()
    return row["id"] if row else None


def exec_schema(db):
    sql_path = os.path.join(BASE_DIR, "create_tables.sql")
    with open(sql_path, "r", encoding="utf-8") as f:
        content = f.read()
    stmts = [s.strip() for s in content.split(";") if s.strip() and not s.strip().startswith("--")]
    with db.cursor() as c:
        for s in stmts:
            c.execute(s)
    db.commit()
    print(f"[schema] 已执行 {len(stmts)} 条建表/初始化语句")


def backup_json():
    ts = time.strftime("%Y%m%d_%H%M%S")
    bdir = os.path.join(BASE_DIR, f"backup_json_{ts}")
    os.makedirs(bdir, exist_ok=True)
    for fn in ["users.json", "announcements.json", "character_profile.json"]:
        src = os.path.join(BASE_DIR, fn)
        if os.path.exists(src):
            shutil.copy(src, os.path.join(bdir, fn))
    data_root = os.path.join(BASE_DIR, "data", "users")
    if os.path.isdir(data_root):
        shutil.copytree(data_root, os.path.join(bdir, "users"), dirs_exist_ok=True)
    print(f"[backup] 原 JSON 已备份到 {bdir}")
    return bdir


def migrate_users(db):
    path = os.path.join(BASE_DIR, "users.json")
    if not os.path.exists(path):
        print("[users] 无 users.json，跳过")
        return
    users = json.load(open(path, encoding="utf-8"))
    n = 0
    with db.cursor() as c:
        for u in users:
            c.execute(
                "INSERT INTO users (username, email, phone, password, avatar, created_at) "
                "VALUES (%s,%s,%s,%s,%s,%s)",
                (u.get("username"), u.get("email"), u.get("phone"),
                 u.get("password"), u.get("avatar"), u.get("created_at", int(time.time()))))
            n += 1
    db.commit()
    print(f"[users] 迁移 {n} 个用户")


def migrate_announcements(db):
    path = os.path.join(BASE_DIR, "announcements.json")
    if not os.path.exists(path):
        print("[ann] 无 announcements.json，跳过")
        return
    data = json.load(open(path, encoding="utf-8"))
    n = 0
    with db.cursor() as c:
        for a in data:
            c.execute(
                "INSERT INTO announcements (id, type, title, body, ts) VALUES (%s,%s,%s,%s,%s)",
                (a.get("id"), a.get("type"), a.get("title"), a.get("body"), a.get("ts")))
            n += 1
    db.commit()
    print(f"[ann] 迁移 {n} 条公告")


def migrate_character(db):
    path = os.path.join(BASE_DIR, "character_profile.json")
    if not os.path.exists(path):
        print("[char] 无 character_profile.json，跳过")
        return
    cp = json.load(open(path, encoding="utf-8"))
    with db.cursor() as c:
        c.execute(
            "INSERT INTO character_profile (id, name, base_setting, learned, learned_turns, updated_at) "
            "VALUES (1,%s,%s,%s,%s,%s) "
            "ON DUPLICATE KEY UPDATE name=VALUES(name), base_setting=VALUES(base_setting), "
            "learned=VALUES(learned), learned_turns=VALUES(learned_turns), updated_at=VALUES(updated_at)",
            (cp.get("name"), cp.get("base_setting"), cp.get("learned"),
             cp.get("learned_turns", 0), cp.get("updated_at", 0)))
    db.commit()
    print("[char] 迁移全局角色画像")


def migrate_memories(db):
    data_root = os.path.join(BASE_DIR, "data", "users")
    if not os.path.isdir(data_root):
        print("[mem] 无 data/users，跳过")
        return
    total_conv = 0
    total_msg = 0
    for uname in sorted(os.listdir(data_root)):
        mpath = os.path.join(data_root, uname, "memory.json")
        if not os.path.isfile(mpath):
            continue
        uid = get_user_id(db, uname)
        if uid is None:
            print(f"[mem] 跳过 {uname}（users 表中无此用户）")
            continue
        mem = json.load(open(mpath, encoding="utf-8"))
        profile = mem.get("profile", {})
        convs = mem.get("conversations", [])
        with db.cursor() as c:
            c.execute(
                "INSERT INTO user_profile "
                "(user_id, name, base_setting, learned, learned_turns, persona_key, persona_title, bot_avatar, updated_at) "
                "VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s) "
                "ON DUPLICATE KEY UPDATE name=VALUES(name), base_setting=VALUES(base_setting), "
                "learned=VALUES(learned), learned_turns=VALUES(learned_turns), "
                "persona_key=VALUES(persona_key), persona_title=VALUES(persona_title), "
                "bot_avatar=VALUES(bot_avatar), updated_at=VALUES(updated_at)",
                (uid, profile.get("name"), profile.get("base_setting"), profile.get("learned"),
                 profile.get("learned_turns", 0), profile.get("persona_key"), profile.get("persona_title"),
                 profile.get("bot_avatar"), profile.get("updated_at", 0)))
            for conv in convs:
                persona = conv.get("persona", {})
                c.execute(
                    "INSERT INTO conversations "
                    "(id, user_id, title, title_lock, pinned, created_at, updated_at, "
                    "p_name, p_base_setting, p_learned, p_learned_turns, p_bot_avatar, "
                    "p_persona_key, p_persona_title, p_updated_at) "
                    "VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) "
                    "ON DUPLICATE KEY UPDATE title=VALUES(title), title_lock=VALUES(title_lock), "
                    "pinned=VALUES(pinned), updated_at=VALUES(updated_at), p_name=VALUES(p_name), "
                    "p_base_setting=VALUES(p_base_setting), p_learned=VALUES(p_learned), "
                    "p_learned_turns=VALUES(p_learned_turns), p_bot_avatar=VALUES(p_bot_avatar), "
                    "p_persona_key=VALUES(p_persona_key), p_persona_title=VALUES(p_persona_title), "
                    "p_updated_at=VALUES(p_updated_at)",
                    (conv.get("id"), uid, conv.get("title"), int(conv.get("titleLock", False)),
                     int(conv.get("pinned", False)), conv.get("createdAt"),
                     conv.get("updated_at", conv.get("createdAt")),
                     persona.get("name"), persona.get("base_setting"), persona.get("learned"),
                     persona.get("learned_turns", 0), persona.get("bot_avatar"),
                     persona.get("persona_key"), persona.get("persona_title"),
                     persona.get("updated_at", 0)))
                msgs = conv.get("messages", [])
                for i, m in enumerate(msgs):
                    c.execute(
                        "INSERT INTO messages "
                        "(conversation_id, user_id, role, content, attachments, files, seq, created_at) "
                        "VALUES (%s,%s,%s,%s,%s,%s,%s,%s)",
                        (conv.get("id"), uid, m.get("role"), m.get("content"),
                         json.dumps(m.get("attachments", []), ensure_ascii=False) if m.get("attachments") else None,
                         json.dumps(m.get("files"), ensure_ascii=False) if m.get("files") else None,
                         i, m.get("created_at", int(time.time() * 1000))))
                total_conv += 1
                total_msg += len(msgs)
    db.commit()
    print(f"[mem] 迁移 {total_conv} 个对话、{total_msg} 条消息")


def main():
    db = get_db()
    try:
        exec_schema(db)
        backup_json()
        migrate_users(db)
        migrate_announcements(db)
        migrate_character(db)
        migrate_memories(db)
        with db.cursor() as c:
            c.execute("SELECT COUNT(*) AS n FROM users"); users_n = c.fetchone()["n"]
            c.execute("SELECT COUNT(*) AS n FROM conversations"); conv_n = c.fetchone()["n"]
            c.execute("SELECT COUNT(*) AS n FROM messages"); msg_n = c.fetchone()["n"]
        print(f"[done] users={users_n} conversations={conv_n} messages={msg_n}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
