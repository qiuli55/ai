import sys, os, tempfile
sys.path.insert(0, r"E:\编程\我的ai(网页版)\speek")
import backend

tmp = tempfile.mktemp(suffix=".json")
backend.USERS_FILE = tmp

c = backend.app.test_client()
fails = []

def check(name, cond):
    print(("PASS" if cond else "FAIL"), name)
    if not cond:
        fails.append(name)

# 1. 注册成功
r = c.post("/api/register", json={"username": "alice123", "phone": "13800138000",
                                   "email": "a@b.com", "password": "abc12345"})
check("register ok", r.get_json().get("ok") is True)

# 2. 重复用户名
r = c.post("/api/register", json={"username": "alice123", "phone": "13900139000",
                                   "email": "b@b.com", "password": "abc12345"})
check("dup username rejected", r.get_json().get("ok") is False)

# 3. 用户名含中文被拒
r = c.post("/api/register", json={"username": "小明", "phone": "13900139000",
                                   "email": "b@b.com", "password": "abc12345"})
check("chinese username rejected", r.get_json().get("ok") is False)

# 4. 弱密码被拒
r = c.post("/api/register", json={"username": "bob99", "phone": "13900139000",
                                   "email": "b@b.com", "password": "123"})
check("weak password rejected", r.get_json().get("ok") is False)

# 5. 无用户时登录 -> needRegister
backend.save_users([])
r = c.post("/api/login", json={"account": "x", "password": "y"})
check("login needRegister when empty", r.get_json().get("needRegister") is True)

# 6. 正确登录
backend.save_users([{
    "username": "alice123", "email": "a@b.com", "phone": "13800138000",
    "password": backend.hash_pwd("alice123", "abc12345"), "created_at": 0
}])
r = c.post("/api/login", json={"account": "alice123", "password": "abc12345"})
check("login ok", r.get_json().get("ok") is True)

# 7. 邮箱登录也能用
r = c.post("/api/login", json={"account": "a@b.com", "password": "abc12345"})
check("login by email", r.get_json().get("ok") is True)

# 8. 错误密码
r = c.post("/api/login", json={"account": "alice123", "password": "wrongpass"})
check("login wrong pwd", r.get_json().get("ok") is False)

os.remove(tmp)
print("\nRESULT:", "ALL PASS" if not fails else ("FAIL: " + ", ".join(fails)))
