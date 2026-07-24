"""NOVA 后端测试"""
import json
import pytest
import sys
sys.path.insert(0, "speek")

from backend import app, hash_pwd, check_pwd, valid_username, valid_password


@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as c:
        yield c


# ── 密码测试 ──
def test_hash_and_check():
    h = hash_pwd("testuser", "MyPass123")
    assert h.startswith("$2b$")  # bcrypt 前缀
    assert check_pwd("testuser", "MyPass123", h)
    assert not check_pwd("testuser", "wrong", h)


def test_sha256_fallback():
    """旧 SHA-256 哈希仍能通过验证"""
    import hashlib
    old = hashlib.sha256(b"oldpass:testuser").hexdigest()
    assert check_pwd("testuser", "oldpass", old)


# ── 输入校验 ──
def test_valid_username():
    assert valid_username("qiuli55")
    assert not valid_username("abc def")
    assert not valid_username("")


def test_valid_password():
    assert valid_password("Abc12345")
    assert not valid_password("12345678")      # 无字母
    assert not valid_password("abcdefgh")      # 无数字
    assert not valid_password("Abc123")        # 太短


# ── API 路由测试 ──
def test_health(client):
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json["status"] == "ok"


def test_register_login_flow(client):
    # 注册
    r = client.post("/api/register", json={
        "username": "test__tmp", "password": "Tmp12345", "email": "t@t.com"
    })
    assert r.status_code == 200

    # 登录
    r = client.post("/api/login", json={
        "account": "test__tmp", "password": "Tmp12345"
    })
    assert r.status_code == 200
    assert r.json["ok"] is True

    # 清理（通过注销）
    r = client.post("/api/delete_account", json={
        "username": "test__tmp", "password": "Tmp12345"
    })
    assert r.status_code == 200
