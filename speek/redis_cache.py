"""
Redis / fakeredis 缓存层
- 优先连接真实 Redis (127.0.0.1:6379)
- 不可用时自动降级为 fakeredis 内存模式
- 用于缓存用户记忆、对话列表、角色画像
"""
import os
import json
import time
import threading
from functools import wraps

import redis
from redis.exceptions import RedisError

# ---- 配置 ----
REDIS_HOST = os.environ.get("REDIS_HOST", "127.0.0.1")
REDIS_PORT = int(os.environ.get("REDIS_PORT", 6379))
REDIS_DB = int(os.environ.get("REDIS_DB", 0))
REDIS_PASSWORD = os.environ.get("REDIS_PASSWORD", None)

# 缓存 TTL（秒）
CACHE_TTL_MEMORY = 300      # 用户记忆 / 对话列表：5 分钟
CACHE_TTL_MESSAGES = 300    # 单对话消息：5 分钟
CACHE_TTL_PROFILE = 600     # 角色画像：10 分钟
CACHE_TTL_CHARACTER = 300   # 角色配置：5 分钟

# ---- 连接 ----
_rclient = None
_lock = threading.Lock()
_using_real = False

def _connect():
    global _rclient, _using_real
    if _rclient is not None:
        return
    with _lock:
        if _rclient is not None:
            return
        # 先尝试连接真实 Redis
        try:
            client = redis.Redis(
                host=REDIS_HOST, port=REDIS_PORT, db=REDIS_DB,
                password=REDIS_PASSWORD,
                socket_connect_timeout=1, socket_timeout=1,
                decode_responses=True,
                protocol=2)  # RESP2 兼容 Redis 5.x (Windows 版)
            client.ping()
            _rclient = client
            _using_real = True
            print(f"[Redis] 已连接真实 Redis {REDIS_HOST}:{REDIS_PORT}")
            return
        except (RedisError, OSError) as e:
            print(f"[Redis] 真实 Redis 不可用 ({e})，降级为 fakeredis 内存模式")

        # 降级到 fakeredis
        import fakeredis
        _rclient = fakeredis.FakeRedis(decode_responses=True)
        _using_real = False
        print("[Redis] 已启用 fakeredis 内存级缓存")


def get_client():
    """获取 Redis 客户端（自动连接）"""
    if _rclient is None:
        _connect()
    return _rclient


def is_real_redis():
    return _using_real


# ---- 缓存装饰器 ----
def cached(key_prefix, ttl=300, is_json=True):
    """
    缓存装饰器：用 key_prefix + 参数拼成 Redis key 自动缓存函数结果。
    
    用法：
        @cached("user_memory", ttl=300)
        def load_user_memory(username):
            ...
    
    调用 load_user_memory("alice") 时，key = "user_memory:alice"
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            r = get_client()
            # 构造 key：前缀 + 所有参数的字符串表示
            key_parts = [key_prefix]
            for a in args:
                key_parts.append(str(a))
            for k in sorted(kwargs.keys()):
                key_parts.append(f"{k}={kwargs[k]}")
            cache_key = ":".join(key_parts)

            # 尝试读缓存
            try:
                raw = r.get(cache_key)
                if raw:
                    if is_json:
                        return json.loads(raw)
                    return raw
            except RedisError:
                pass

            # 缓存未命中，执行函数
            result = func(*args, **kwargs)

            # 写缓存
            try:
                if is_json:
                    r.setex(cache_key, ttl, json.dumps(result, ensure_ascii=False, default=str))
                else:
                    r.setex(cache_key, ttl, str(result))
            except RedisError:
                pass

            return result
        return wrapper
    return decorator


def invalidate(pattern):
    """按模式删除缓存 key（如 "user_memory:*"）"""
    try:
        r = get_client()
        keys = list(r.scan_iter(match=pattern, count=100))
        if keys:
            r.delete(*keys)
            return len(keys)
    except RedisError:
        pass
    return 0


def cache_get(key):
    """直接读缓存"""
    try:
        raw = get_client().get(key)
        if raw:
            return json.loads(raw)
    except (RedisError, json.JSONDecodeError):
        pass
    return None


def cache_set(key, value, ttl=300):
    """直接写缓存"""
    try:
        get_client().setex(key, ttl, json.dumps(value, ensure_ascii=False, default=str))
    except RedisError:
        pass


def cache_delete(key):
    """直接删缓存"""
    try:
        get_client().delete(key)
    except RedisError:
        pass


def cache_delete_pattern(pattern):
    """按模式删除"""
    return invalidate(pattern)


# ---- 便捷方法 ----
def cache_user_memory(username, data):
    """缓存用户记忆"""
    cache_set(f"user_memory:{username}", data, CACHE_TTL_MEMORY)


def get_user_memory_cache(username):
    """读取缓存的用户记忆"""
    return cache_get(f"user_memory:{username}")


def invalidate_user(username):
    """用户数据变更时使缓存失效"""
    cache_delete(f"user_memory:{username}")
    cache_delete_pattern(f"user_conv_msgs:{username}:*")


def cache_conversation_messages(username, conversation_id, messages):
    """缓存单对话消息"""
    cache_set(f"user_conv_msgs:{username}:{conversation_id}", messages, CACHE_TTL_MESSAGES)


def get_conversation_messages_cache(username, conversation_id):
    """读取缓存的对话消息"""
    return cache_get(f"user_conv_msgs:{username}:{conversation_id}")


def invalidate_conversation(username, conversation_id):
    """对话消息变更时使缓存失效"""
    cache_delete(f"user_conv_msgs:{username}:{conversation_id}")
    cache_delete(f"user_memory:{username}")


# ---- 初始化 ----
def init_redis():
    """显式初始化（在 backend 启动时调用）"""
    _connect()
    return _rclient
