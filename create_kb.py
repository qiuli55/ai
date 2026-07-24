import sqlite3, uuid, time, json, os, hashlib

DB = r'D:\open-webui\python\Lib\site-packages\open_webui\data\webui.db'
PROJECT_DIR = r'E:\编程\我的ai(网页版)'

conn = sqlite3.connect(DB)
cur = conn.cursor()
now = int(time.time() * 1000)
user_id = 'b182ce5e-ae5e-4a2d-9222-65168e9d6e5b'

# 1. 创建知识库
kb_id = str(uuid.uuid4())
cur.execute("""INSERT INTO knowledge (id, user_id, name, description, data, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)""",
    (kb_id, user_id, 'NOVA Project Files',
     'NOVA AI project - homepage, auth, chat frontend files',
     json.dumps({'model': '', 'threshold': 0.0, 'top_k': 3}),
     now, now))
print(f'Created knowledge base: {kb_id[:12]}...')

# 2. 上传文件
project_files = [
    'homepage/index.html',
    'homepage/style.css',
    'homepage/app.js',
    'auth/index.html',
    'auth/style.css',
    'auth/app.js',
    'speek/index.html',
    'speek/style.css',
    'speek/app.js',
]

file_ids = []
for rel_path in project_files:
    file_path = os.path.join(PROJECT_DIR, rel_path)
    if not os.path.exists(file_path):
        print(f'[Skip] {rel_path}: not found')
        continue

    with open(file_path, 'rb') as f:
        content = f.read()

    file_id = str(uuid.uuid4())
    file_name = rel_path.split('/')[-1]
    file_hash = hashlib.sha256(content).hexdigest()

    cur.execute("""INSERT INTO file (id, user_id, filename, path, hash, data, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
        (file_id, user_id, file_name, rel_path, file_hash,
         json.dumps({'size': len(content)}),
         now, now))

    # Save file content to disk
    data_dir = os.path.join(os.path.dirname(DB), 'uploads')
    os.makedirs(data_dir, exist_ok=True)
    save_path = os.path.join(data_dir, file_id)
    with open(save_path, 'wb') as f:
        f.write(content)

    file_ids.append(file_id)
    print(f'[Upload] {rel_path} ({len(content)//1024}KB) -> {file_id[:8]}...')

# 3. 关联知识库和文件
for file_id in file_ids:
    cur.execute("""INSERT INTO knowledge_file (id, knowledge_id, file_id, user_id, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)""",
        (str(uuid.uuid4()), kb_id, file_id, user_id, now, now))

conn.commit()
conn.close()
print(f'\nDone! KB: {kb_id}')
print(f'Files: {len(file_ids)} uploaded')
