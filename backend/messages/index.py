"""
Сообщения AMessage: получение (action=list) и отправка (action=send) сообщений.
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
    cur.execute(f'SELECT id FROM "{SCHEMA}".users WHERE token = %s', (token,))
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
    action = body.get("action") or params.get("action") or ("list" if method == "GET" else "send")

    # LIST MESSAGES
    if action == "list":
        chat_id = body.get("chat_id") or params.get("chat_id")
        if not chat_id:
            cur.close()
            conn.close()
            return resp({"error": "Укажите chat_id"}, 400)

        cur.execute(f'SELECT 1 FROM "{SCHEMA}".chat_members WHERE chat_id = %s AND user_id = %s', (chat_id, user_id))
        if not cur.fetchone():
            cur.close()
            conn.close()
            return resp({"error": "Нет доступа к этому чату"}, 403)

        limit = int(params.get("limit") or body.get("limit") or 50)
        offset = int(params.get("offset") or body.get("offset") or 0)

        cur.execute(f'''
            SELECT m.id, m.text, m.sender_id, m.is_read, m.created_at,
                   u.display_name, u.avatar_color, u.avatar_initials
            FROM "{SCHEMA}".messages m
            JOIN "{SCHEMA}".users u ON u.id = m.sender_id
            WHERE m.chat_id = %s
            ORDER BY m.created_at ASC
            LIMIT %s OFFSET %s
        ''', (chat_id, limit, offset))
        rows = cur.fetchall()

        cur.execute(f'''
            UPDATE "{SCHEMA}".messages SET is_read = TRUE
            WHERE chat_id = %s AND sender_id != %s AND is_read = FALSE
        ''', (chat_id, user_id))
        conn.commit()
        cur.close()
        conn.close()

        return resp([{
            "id": r[0], "text": r[1], "sender_id": r[2],
            "is_mine": r[2] == user_id, "is_read": r[3],
            "created_at": r[4], "sender_name": r[5],
            "sender_color": r[6], "sender_initials": r[7]
        } for r in rows])

    # SEND MESSAGE
    if action == "send":
        chat_id = body.get("chat_id")
        text = (body.get("text") or "").strip()

        if not chat_id or not text:
            cur.close()
            conn.close()
            return resp({"error": "Укажите chat_id и text"}, 400)

        cur.execute(f'SELECT 1 FROM "{SCHEMA}".chat_members WHERE chat_id = %s AND user_id = %s', (chat_id, user_id))
        if not cur.fetchone():
            cur.close()
            conn.close()
            return resp({"error": "Нет доступа"}, 403)

        cur.execute(f'''
            INSERT INTO "{SCHEMA}".messages (chat_id, sender_id, text)
            VALUES (%s, %s, %s)
            RETURNING id, text, sender_id, is_read, created_at
        ''', (chat_id, user_id, text))
        row = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()

        return resp({
            "id": row[0], "text": row[1], "sender_id": row[2],
            "is_mine": True, "is_read": row[3], "created_at": row[4]
        })

    cur.close()
    conn.close()
    return resp({"error": "Неизвестное действие"}, 400)
