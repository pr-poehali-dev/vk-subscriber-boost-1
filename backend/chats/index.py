"""
Чаты AMessage: список чатов, создание direct/group чата.
action: list | create
"""
import json
import os
import psycopg2

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "t_p18178531_vk_subscriber_boost_")

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-User-Id, X-Auth-Token",
}

def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def get_user_by_token(cur, token):
    cur.execute(f'SELECT id, username, display_name, avatar_color, avatar_initials FROM "{SCHEMA}".users WHERE token = %s', (token,))
    return cur.fetchone()

def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    headers = event.get("headers") or {}
    params = event.get("queryStringParameters") or {}

    def resp(data, status=200):
        return {"statusCode": status, "headers": {**CORS, "Content-Type": "application/json"}, "body": json.dumps(data, ensure_ascii=False, default=str)}

    body = {}
    if method == "POST":
        body = json.loads(event.get("body") or "{}")

    token = headers.get("x-auth-token") or headers.get("X-Auth-Token") or body.get("token") or ""
    if not token:
        return resp({"error": "Не авторизован"}, 401)

    conn = get_conn()
    cur = conn.cursor()

    user = get_user_by_token(cur, token)
    if not user:
        cur.close()
        conn.close()
        return resp({"error": "Токен недействителен"}, 401)

    user_id = user[0]
    action = body.get("action") or params.get("action") or ("list" if method == "GET" else "")

    # LIST CHATS
    if action == "list" or method == "GET":
        cur.execute(f'''
            SELECT
                c.id, c.type, c.name, c.avatar_color, c.avatar_initials,
                last_m.text AS last_msg,
                last_m.created_at AS last_time,
                (SELECT COUNT(*) FROM "{SCHEMA}".messages m2
                 WHERE m2.chat_id = c.id AND m2.sender_id != %(uid)s AND m2.is_read = FALSE) AS unread,
                u2.display_name, u2.avatar_color, u2.avatar_initials, u2.is_online, u2.id
            FROM "{SCHEMA}".chats c
            JOIN "{SCHEMA}".chat_members cm ON cm.chat_id = c.id AND cm.user_id = %(uid)s
            LEFT JOIN LATERAL (
                SELECT text, created_at FROM "{SCHEMA}".messages
                WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1
            ) last_m ON TRUE
            LEFT JOIN "{SCHEMA}".chat_members cm2 ON cm2.chat_id = c.id AND cm2.user_id != %(uid)s
            LEFT JOIN "{SCHEMA}".users u2 ON u2.id = cm2.user_id AND c.type = 'direct'
            ORDER BY COALESCE(last_m.created_at, c.created_at) DESC
        ''', {"uid": user_id})
        rows = cur.fetchall()
        cur.close()
        conn.close()

        chats = []
        seen = set()
        for r in rows:
            if r[0] in seen:
                continue
            seen.add(r[0])
            is_direct = r[1] == "direct"
            chats.append({
                "id": r[0], "type": r[1],
                "name": (r[8] or r[2] or "Чат") if is_direct else (r[2] or "Группа"),
                "avatar_color": (r[9] or r[3] or "from-purple-500 to-cyan-500") if is_direct else (r[3] or "from-cyan-500 to-blue-500"),
                "avatar_initials": (r[10] or r[4] or "?") if is_direct else (r[4] or "ГР"),
                "last_message": r[5] or "",
                "last_time": r[6],
                "unread": r[7] or 0,
                "other_online": r[11] or False,
                "other_id": r[12]
            })
        return resp(chats)

    # CREATE CHAT
    if action == "create":
        target_user_id = body.get("user_id")
        group_name = body.get("name")
        members = body.get("members", [])

        if target_user_id:
            cur.execute(f'''
                SELECT c.id FROM "{SCHEMA}".chats c
                JOIN "{SCHEMA}".chat_members cm1 ON cm1.chat_id = c.id AND cm1.user_id = %s
                JOIN "{SCHEMA}".chat_members cm2 ON cm2.chat_id = c.id AND cm2.user_id = %s
                WHERE c.type = 'direct'
                LIMIT 1
            ''', (user_id, int(target_user_id)))
            existing = cur.fetchone()
            if existing:
                cur.close()
                conn.close()
                return resp({"id": existing[0], "existed": True})

            cur.execute(f'INSERT INTO "{SCHEMA}".chats (type) VALUES (\'direct\') RETURNING id')
            chat_id = cur.fetchone()[0]
            cur.execute(f'INSERT INTO "{SCHEMA}".chat_members (chat_id, user_id) VALUES (%s, %s)', (chat_id, user_id))
            cur.execute(f'INSERT INTO "{SCHEMA}".chat_members (chat_id, user_id) VALUES (%s, %s)', (chat_id, int(target_user_id)))
            conn.commit()
            cur.close()
            conn.close()
            return resp({"id": chat_id, "existed": False})

        elif group_name:
            member_ids = list(set([user_id] + [int(m) for m in members]))
            initials = group_name[:2].upper()
            cur.execute(
                f'INSERT INTO "{SCHEMA}".chats (type, name, avatar_initials, avatar_color) VALUES (\'group\', %s, %s, %s) RETURNING id',
                (group_name, initials, "from-cyan-500 to-blue-500")
            )
            chat_id = cur.fetchone()[0]
            for mid in member_ids:
                cur.execute(f'INSERT INTO "{SCHEMA}".chat_members (chat_id, user_id) VALUES (%s, %s)', (chat_id, mid))
            conn.commit()
            cur.close()
            conn.close()
            return resp({"id": chat_id})

        cur.close()
        conn.close()
        return resp({"error": "Укажите user_id или name"}, 400)

    cur.close()
    conn.close()
    return resp({"error": "Неизвестное действие"}, 400)
