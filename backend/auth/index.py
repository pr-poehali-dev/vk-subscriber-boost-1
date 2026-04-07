"""
Авторизация AMessage: register, login, logout, me, search.
Action передаётся в поле action тела запроса (POST) или query param (GET).
"""
import json
import os
import hashlib
import secrets
import psycopg2

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "t_p18178531_vk_subscriber_boost_")

COLORS = [
    "from-purple-500 to-pink-500",
    "from-cyan-500 to-blue-500",
    "from-orange-400 to-red-500",
    "from-green-400 to-teal-500",
    "from-violet-500 to-purple-600",
    "from-yellow-400 to-orange-500",
    "from-pink-500 to-rose-600",
    "from-blue-400 to-indigo-500",
]

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-User-Id, X-Auth-Token",
}

def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def hash_password(pwd: str) -> str:
    return hashlib.sha256(pwd.encode()).hexdigest()

def make_initials(name: str) -> str:
    parts = name.strip().split()
    if len(parts) >= 2:
        return (parts[0][0] + parts[1][0]).upper()
    return name[:2].upper()

def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    headers = event.get("headers") or {}
    params = event.get("queryStringParameters") or {}

    def resp(data, status=200):
        return {"statusCode": status, "headers": {**CORS, "Content-Type": "application/json"}, "body": json.dumps(data, ensure_ascii=False)}

    body = {}
    if method == "POST":
        body = json.loads(event.get("body") or "{}")

    action = body.get("action") or params.get("action") or ""
    token = headers.get("x-auth-token") or headers.get("X-Auth-Token") or body.get("token") or ""

    # REGISTER
    if action == "register":
        username = (body.get("username") or "").strip().lower()
        display_name = (body.get("display_name") or "").strip()
        password = body.get("password") or ""

        if not username or not display_name or not password:
            return resp({"error": "Заполните все поля"}, 400)
        if len(username) < 3:
            return resp({"error": "Имя пользователя минимум 3 символа"}, 400)
        if len(password) < 6:
            return resp({"error": "Пароль минимум 6 символов"}, 400)

        color = COLORS[hash(username) % len(COLORS)]
        initials = make_initials(display_name)
        new_token = secrets.token_hex(32)
        pwd_hash = hash_password(password)

        conn = get_conn()
        cur = conn.cursor()
        try:
            cur.execute(
                f'INSERT INTO "{SCHEMA}".users (username, display_name, password_hash, token, avatar_color, avatar_initials, is_online) '
                'VALUES (%s, %s, %s, %s, %s, %s, TRUE) RETURNING id, username, display_name, avatar_color, avatar_initials, token',
                (username, display_name, pwd_hash, new_token, color, initials)
            )
            row = cur.fetchone()
            conn.commit()
            return resp({"id": row[0], "username": row[1], "display_name": row[2], "avatar_color": row[3], "avatar_initials": row[4], "token": row[5]})
        except psycopg2.errors.UniqueViolation:
            conn.rollback()
            return resp({"error": "Имя пользователя уже занято"}, 409)
        finally:
            cur.close()
            conn.close()

    # LOGIN
    if action == "login":
        username = (body.get("username") or "").strip().lower()
        password = body.get("password") or ""

        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f'SELECT id, username, display_name, avatar_color, avatar_initials, password_hash, token FROM "{SCHEMA}".users WHERE username = %s',
            (username,)
        )
        row = cur.fetchone()
        if not row or row[5] != hash_password(password):
            cur.close()
            conn.close()
            return resp({"error": "Неверный логин или пароль"}, 401)

        saved_token = row[6] or secrets.token_hex(32)
        cur.execute(f'UPDATE "{SCHEMA}".users SET is_online = TRUE, last_seen = NOW(), token = %s WHERE id = %s', (saved_token, row[0]))
        conn.commit()
        cur.close()
        conn.close()
        return resp({"id": row[0], "username": row[1], "display_name": row[2], "avatar_color": row[3], "avatar_initials": row[4], "token": saved_token})

    # ME
    if action == "me" or (method == "GET" and not action and token):
        if not token:
            return resp({"error": "Не авторизован"}, 401)
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f'SELECT id, username, display_name, avatar_color, avatar_initials FROM "{SCHEMA}".users WHERE token = %s',
            (token,)
        )
        row = cur.fetchone()
        cur.close()
        conn.close()
        if not row:
            return resp({"error": "Токен недействителен"}, 401)
        return resp({"id": row[0], "username": row[1], "display_name": row[2], "avatar_color": row[3], "avatar_initials": row[4]})

    # LOGOUT
    if action == "logout":
        if token:
            conn = get_conn()
            cur = conn.cursor()
            cur.execute(f'UPDATE "{SCHEMA}".users SET is_online = FALSE, last_seen = NOW() WHERE token = %s', (token,))
            conn.commit()
            cur.close()
            conn.close()
        return resp({"ok": True})

    # SEARCH USERS
    if action == "search":
        if not token:
            return resp({"error": "Не авторизован"}, 401)
        q = body.get("q") or params.get("q") or ""
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f'SELECT id, username, display_name, avatar_color, avatar_initials, is_online FROM "{SCHEMA}".users '
            'WHERE (username ILIKE %s OR display_name ILIKE %s) AND token != %s LIMIT 20',
            (f"%{q}%", f"%{q}%", token)
        )
        rows = cur.fetchall()
        cur.close()
        conn.close()
        return resp([{"id": r[0], "username": r[1], "display_name": r[2], "avatar_color": r[3], "avatar_initials": r[4], "is_online": r[5]} for r in rows])

    return resp({"error": "Неизвестное действие"}, 400)
