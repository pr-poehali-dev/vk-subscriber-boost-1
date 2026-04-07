import { useState, useEffect, useRef, useCallback } from "react";
import Icon from "@/components/ui/icon";
import { authApi, chatsApi, messagesApi } from "@/lib/api";

// ─── Types ───────────────────────────────────────────────────────────────────

interface User {
  id: number;
  username: string;
  display_name: string;
  avatar_color: string;
  avatar_initials: string;
  token?: string;
}

interface Chat {
  id: number;
  type: string;
  name: string;
  avatar_color: string;
  avatar_initials: string;
  last_message: string;
  last_time: string | null;
  unread: number;
  other_online: boolean;
  other_id?: number;
}

interface Message {
  id: number;
  text: string;
  sender_id: number;
  is_mine: boolean;
  is_read: boolean;
  created_at: string;
  sender_name: string;
  sender_color: string;
  sender_initials: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: "chats", label: "Чаты", icon: "MessageCircle" },
  { id: "contacts", label: "Контакты", icon: "Users" },
  { id: "statuses", label: "Статусы", icon: "Circle" },
  { id: "calls", label: "Звонки", icon: "Phone" },
  { id: "search", label: "Поиск", icon: "Search" },
  { id: "settings", label: "Настройки", icon: "Settings" },
];

function fmt(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 86400000 && d.getDate() === now.getDate())
    return d.toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" });
  if (diff < 172800000) return "вч";
  return d.toLocaleDateString("ru", { day: "numeric", month: "short" });
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ initials, color, size = "md", online }: {
  initials: string; color: string; size?: "sm" | "md" | "lg"; online?: boolean;
}) {
  const sizes = { sm: "w-9 h-9 text-xs", md: "w-11 h-11 text-sm", lg: "w-14 h-14 text-base" };
  return (
    <div className="relative flex-shrink-0">
      <div className={`${sizes[size]} rounded-full bg-gradient-to-br ${color} flex items-center justify-center font-bold text-white select-none`}>
        {initials || "?"}
      </div>
      {online !== undefined && (
        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[hsl(220,20%,6%)] online-dot ${online ? "bg-emerald-400" : "bg-gray-500"}`} />
      )}
    </div>
  );
}

// ─── Auth Screen ──────────────────────────────────────────────────────────────

function AuthScreen({ onAuth }: { onAuth: (user: User) => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError("");
    setLoading(true);
    try {
      const res = mode === "login"
        ? await authApi.login(username, password)
        : await authApi.register(username, displayName, password);
      if (res.error) { setError(res.error as string); return; }
      localStorage.setItem("am_token", res.token as string);
      onAuth(res as unknown as User);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-[hsl(220,20%,6%)]"
      style={{ backgroundImage: "radial-gradient(circle at 30% 70%, rgba(139,92,246,0.1) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(6,182,212,0.08) 0%, transparent 50%)" }}>
      <div className="w-full max-w-sm mx-4 animate-slide-up">
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-20 h-20 rounded-3xl am-gradient flex items-center justify-center am-glow float">
            <span className="text-white font-black text-3xl font-['Montserrat']">A</span>
          </div>
          <h1 className="text-3xl font-black font-['Montserrat'] am-gradient-text">AMessage</h1>
          <p className="text-sm text-[hsl(215,20%,50%)]">Мессенджер нового поколения</p>
        </div>

        <div className="am-surface rounded-3xl p-6 space-y-4">
          <div className="flex rounded-2xl bg-[hsl(220,16%,13%)] p-1">
            {(["login", "register"] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError(""); }}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${mode === m ? "am-gradient text-white" : "text-[hsl(215,20%,50%)]"}`}>
                {m === "login" ? "Войти" : "Регистрация"}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <input
              placeholder="Имя пользователя"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full bg-[hsl(220,16%,13%)] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[hsl(215,20%,50%)] border border-[hsl(220,16%,18%)] focus:outline-none focus:border-purple-500/60 transition-colors"
            />
            {mode === "register" && (
              <input
                placeholder="Имя для отображения"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className="w-full bg-[hsl(220,16%,13%)] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[hsl(215,20%,50%)] border border-[hsl(220,16%,18%)] focus:outline-none focus:border-purple-500/60 transition-colors"
              />
            )}
            <input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && submit()}
              className="w-full bg-[hsl(220,16%,13%)] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[hsl(215,20%,50%)] border border-[hsl(220,16%,18%)] focus:outline-none focus:border-purple-500/60 transition-colors"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2.5 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            onClick={submit}
            disabled={loading}
            className="w-full am-gradient text-white font-semibold py-3 rounded-2xl am-glow transition-all active:scale-95 disabled:opacity-60"
          >
            {loading ? "Подождите..." : mode === "login" ? "Войти" : "Создать аккаунт"}
          </button>
        </div>

        <p className="text-center text-xs text-[hsl(215,20%,50%)] mt-4">
          AMessage · Безопасный мессенджер с облачной синхронизацией
        </p>
      </div>
    </div>
  );
}

// ─── Chats Section ────────────────────────────────────────────────────────────

function ChatsSection({ chats, loading, onOpen, onRefresh }: {
  chats: Chat[]; loading: boolean;
  onOpen: (c: Chat) => void; onRefresh: () => void;
}) {
  const [filter, setFilter] = useState("");
  const filtered = filter ? chats.filter(c => c.name.toLowerCase().includes(filter.toLowerCase())) : chats;

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold font-['Montserrat'] am-gradient-text">Чаты</h1>
          <button onClick={onRefresh} className="w-9 h-9 rounded-full am-gradient flex items-center justify-center am-glow">
            <Icon name={loading ? "Loader" : "RefreshCw"} size={16} className={`text-white ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
        <div className="relative">
          <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(215,20%,50%)]" />
          <input
            placeholder="Поиск по чатам..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="w-full bg-[hsl(220,16%,13%)] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-[hsl(215,20%,50%)] border border-[hsl(220,16%,18%)] focus:outline-none focus:border-purple-500/50 transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5">
        {loading && chats.length === 0 && (
          <div className="flex items-center justify-center h-32 text-[hsl(215,20%,50%)] text-sm gap-2">
            <Icon name="Loader" size={16} className="animate-spin" />
            Загружаю чаты...
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 gap-3 text-[hsl(215,20%,50%)]">
            <Icon name="MessageCircle" size={36} />
            <p className="text-sm text-center">Нет чатов.<br/>Найди собеседника через «Контакты»!</p>
          </div>
        )}
        {filtered.map((chat, i) => (
          <button
            key={chat.id}
            onClick={() => onOpen(chat)}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl hover:bg-[hsl(220,16%,13%)] transition-all duration-200 text-left"
            style={{ animationDelay: `${i * 30}ms` }}
          >
            <Avatar initials={chat.avatar_initials} color={chat.avatar_color} online={chat.other_online} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-white truncate">{chat.name}</span>
                <span className="text-xs text-[hsl(215,20%,50%)] ml-2 flex-shrink-0">{fmt(chat.last_time)}</span>
              </div>
              <div className="flex items-center justify-between mt-0.5">
                <span className="text-xs text-[hsl(215,20%,50%)] truncate">{chat.last_message || "Начните переписку"}</span>
                {chat.unread > 0 && (
                  <span className="ml-2 min-w-[20px] h-5 px-1.5 rounded-full am-gradient flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                    {chat.unread}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Chat Window ──────────────────────────────────────────────────────────────

function ChatWindow({ chat, me, onClose, onMessageSent }: {
  chat: Chat; me: User; onClose: () => void; onMessageSent: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    const data = await messagesApi.list(chat.id);
    if (Array.isArray(data)) setMessages(data as Message[]);
    setLoading(false);
  }, [chat.id]);

  useEffect(() => {
    setLoading(true);
    setMessages([]);
    load();
    pollRef.current = setInterval(load, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [chat.id, load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const t = text.trim();
    if (!t || sending) return;
    setSending(true);
    setText("");
    const res = await messagesApi.send(chat.id, t);
    if (res && !res.error) {
      setMessages(prev => [...prev, res as unknown as Message]);
      onMessageSent();
    }
    setSending(false);
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="glass px-4 py-3 flex items-center gap-3 border-b border-[hsl(220,16%,18%)]">
        <button onClick={onClose} className="w-8 h-8 rounded-xl hover:bg-[hsl(220,16%,13%)] flex items-center justify-center transition-colors">
          <Icon name="ChevronLeft" size={20} className="text-[hsl(215,20%,50%)]" />
        </button>
        <Avatar initials={chat.avatar_initials} color={chat.avatar_color} size="sm" online={chat.other_online} />
        <div className="flex-1">
          <div className="font-semibold text-sm text-white">{chat.name}</div>
          <div className="text-xs text-cyan-400">{chat.other_online ? "В сети" : "Был(а) недавно"}</div>
        </div>
        <button className="w-8 h-8 rounded-xl hover:bg-[hsl(220,16%,13%)] flex items-center justify-center transition-colors">
          <Icon name="Phone" size={16} className="text-[hsl(215,20%,50%)]" />
        </button>
        <button className="w-8 h-8 rounded-xl hover:bg-[hsl(220,16%,13%)] flex items-center justify-center transition-colors">
          <Icon name="Video" size={16} className="text-[hsl(215,20%,50%)]" />
        </button>
      </div>

      <div
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
        style={{ backgroundImage: "radial-gradient(circle at 20% 80%, rgba(139,92,246,0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(6,182,212,0.05) 0%, transparent 50%)" }}
      >
        {loading && (
          <div className="flex items-center justify-center h-full text-[hsl(215,20%,50%)] gap-2">
            <Icon name="Loader" size={18} className="animate-spin" />
            Загружаю сообщения...
          </div>
        )}
        {!loading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-[hsl(215,20%,50%)]">
            <Icon name="MessageCircle" size={40} />
            <p className="text-sm">Начните переписку!</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={m.id}
            className={`flex ${m.is_mine ? "justify-end" : "justify-start"} message-in`}
            style={{ animationDelay: `${Math.min(i, 10) * 20}ms` }}
          >
            {!m.is_mine && (
              <div className="mr-2 flex-shrink-0 self-end">
                <Avatar initials={m.sender_initials || "?"} color={m.sender_color || "from-purple-500 to-cyan-500"} size="sm" />
              </div>
            )}
            <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
              m.is_mine
                ? "am-gradient text-white rounded-br-sm"
                : "bg-[hsl(220,16%,13%)] text-white rounded-bl-sm border border-[hsl(220,16%,18%)]"
            }`}>
              {!m.is_mine && chat.type === "group" && (
                <div className="text-xs text-purple-300 font-semibold mb-1">{m.sender_name}</div>
              )}
              <p>{m.text}</p>
              <div className={`flex items-center gap-1 mt-1 ${m.is_mine ? "justify-end" : "justify-start"}`}>
                <span className={`text-[10px] ${m.is_mine ? "text-white/70" : "text-[hsl(215,20%,50%)]"}`}>
                  {fmt(m.created_at)}
                </span>
                {m.is_mine && <Icon name={m.is_read ? "CheckCheck" : "Check"} size={12} className="text-white/70" />}
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="glass px-4 py-3 border-t border-[hsl(220,16%,18%)]">
        <div className="flex items-center gap-2">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
            placeholder="Написать сообщение..."
            className="flex-1 bg-[hsl(220,16%,13%)] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-[hsl(215,20%,50%)] border border-[hsl(220,16%,18%)] focus:outline-none focus:border-purple-500/50 transition-colors"
          />
          <button
            onClick={send}
            disabled={!text.trim() || sending}
            className="w-10 h-10 rounded-xl am-gradient flex items-center justify-center am-glow flex-shrink-0 transition-transform active:scale-95 disabled:opacity-40"
          >
            <Icon name={sending ? "Loader" : "Send"} size={16} className={`text-white ${sending ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Contacts Section ─────────────────────────────────────────────────────────

function ContactsSection({ me, onStartChat }: { me: User; onStartChat: (userId: number) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const search = async (q: string) => {
    setQuery(q);
    if (q.length < 1) { setResults([]); return; }
    setLoading(true);
    const res = await authApi.search(q);
    setResults(Array.isArray(res) ? res as User[] : []);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="px-4 pt-4 pb-3">
        <h1 className="text-2xl font-bold font-['Montserrat'] am-gradient-text mb-4">Контакты</h1>
        <div className="relative">
          <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(215,20%,50%)]" />
          <input
            placeholder="Найти пользователя..."
            value={query}
            onChange={e => search(e.target.value)}
            className="w-full bg-[hsl(220,16%,13%)] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-[hsl(215,20%,50%)] border border-[hsl(220,16%,18%)] focus:outline-none focus:border-purple-500/50 transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {loading && (
          <div className="flex items-center justify-center h-20 gap-2 text-[hsl(215,20%,50%)] text-sm">
            <Icon name="Loader" size={14} className="animate-spin" />
            Ищу...
          </div>
        )}
        {!loading && query.length > 0 && results.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 gap-2 text-[hsl(215,20%,50%)]">
            <Icon name="UserX" size={32} />
            <p className="text-sm">Никого не найдено</p>
          </div>
        )}
        {!loading && query.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-[hsl(215,20%,50%)]">
            <Icon name="Users" size={40} />
            <p className="text-sm text-center">Введите имя или username<br/>чтобы найти собеседника</p>
          </div>
        )}
        {results.map((u, i) => (
          <div
            key={u.id}
            className="flex items-center gap-3 px-3 py-3 rounded-2xl hover:bg-[hsl(220,16%,13%)] transition-all cursor-pointer animate-fade-in"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <Avatar initials={u.avatar_initials} color={u.avatar_color} />
            <div className="flex-1">
              <div className="font-semibold text-sm text-white">{u.display_name}</div>
              <div className="text-xs text-[hsl(215,20%,50%)]">@{u.username}</div>
            </div>
            <button
              onClick={() => onStartChat(u.id)}
              className="px-3 py-1.5 rounded-xl am-gradient text-white text-xs font-semibold am-glow"
            >
              Написать
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Statuses Section ─────────────────────────────────────────────────────────

function StatusesSection() {
  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="px-4 pt-4 pb-3">
        <h1 className="text-2xl font-bold font-['Montserrat'] am-gradient-text mb-4">Статусы</h1>
      </div>
      <div className="flex-1 px-4 pb-4">
        <div className="flex items-center gap-4 cursor-pointer mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 p-0.5 animate-pulse-glow">
            <div className="w-full h-full rounded-full bg-[hsl(220,20%,6%)] flex items-center justify-center">
              <Icon name="Plus" size={24} className="text-purple-400" />
            </div>
          </div>
          <div>
            <div className="font-semibold text-sm text-white">Добавить статус</div>
            <div className="text-xs text-[hsl(215,20%,50%)]">Поделитесь моментом</div>
          </div>
        </div>
        <div className="flex items-center justify-center h-40 flex-col gap-3 text-[hsl(215,20%,50%)]">
          <Icon name="Circle" size={36} />
          <p className="text-sm text-center">Статусы других пользователей<br/>появятся здесь</p>
        </div>
      </div>
    </div>
  );
}

// ─── Calls Section ────────────────────────────────────────────────────────────

function CallsSection() {
  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="px-4 pt-4 pb-3">
        <h1 className="text-2xl font-bold font-['Montserrat'] am-gradient-text mb-4">Звонки</h1>
      </div>
      <div className="flex-1 flex items-center justify-center flex-col gap-3 text-[hsl(215,20%,50%)]">
        <div className="w-20 h-20 rounded-full am-gradient flex items-center justify-center am-glow float">
          <Icon name="Phone" size={36} className="text-white" />
        </div>
        <p className="font-semibold text-white">Звонки</p>
        <p className="text-sm text-center">История звонков появится здесь.<br/>Начни разговор из чата!</p>
      </div>
    </div>
  );
}

// ─── Search Section ───────────────────────────────────────────────────────────

function SearchSection({ me, onStartChat }: { me: User; onStartChat: (userId: number) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const search = async (q: string) => {
    setQuery(q);
    if (q.length < 1) { setResults([]); return; }
    setLoading(true);
    const res = await authApi.search(q);
    setResults(Array.isArray(res) ? res as User[] : []);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="px-4 pt-4 pb-3">
        <h1 className="text-2xl font-bold font-['Montserrat'] am-gradient-text mb-4">Поиск</h1>
        <div className="relative">
          <Icon name="Search" size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
          <input
            autoFocus
            value={query}
            onChange={e => search(e.target.value)}
            placeholder="Найти людей..."
            className="w-full bg-[hsl(220,16%,13%)] rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-[hsl(215,20%,50%)] border border-[hsl(220,16%,18%)] focus:outline-none focus:border-purple-500/60 transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {query.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 pb-20">
            <div className="w-20 h-20 rounded-full am-gradient flex items-center justify-center am-glow float">
              <Icon name="Search" size={36} className="text-white" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-white">Глобальный поиск</p>
              <p className="text-sm text-[hsl(215,20%,50%)] mt-1">Найдите людей по имени или @username</p>
            </div>
          </div>
        )}
        {loading && <div className="flex justify-center py-6"><Icon name="Loader" size={20} className="animate-spin text-purple-400" /></div>}
        {!loading && query.length > 0 && results.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 gap-2 text-[hsl(215,20%,50%)]">
            <Icon name="SearchX" size={32} />
            <p className="text-sm">Никого не найдено</p>
          </div>
        )}
        {results.map((u, i) => (
          <div
            key={u.id}
            className="flex items-center gap-3 py-3 border-b border-[hsl(220,16%,18%)] animate-fade-in cursor-pointer hover:bg-[hsl(220,16%,13%)] rounded-xl px-2 -mx-2"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <Avatar initials={u.avatar_initials} color={u.avatar_color} />
            <div className="flex-1">
              <div className="font-semibold text-sm text-white">{u.display_name}</div>
              <div className="text-xs text-[hsl(215,20%,50%)]">@{u.username}</div>
            </div>
            <button
              onClick={() => onStartChat(u.id)}
              className="px-3 py-1.5 rounded-xl am-gradient text-white text-xs font-semibold"
            >
              Написать
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Settings Section ─────────────────────────────────────────────────────────

function SettingsSection({ me, onLogout }: { me: User; onLogout: () => void }) {
  const [notifications, setNotifications] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);
  const [sound, setSound] = useState(true);
  const [animations, setAnimations] = useState(true);

  const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
    <button onClick={onChange}
      className={`relative w-12 h-6 rounded-full transition-all duration-300 flex-shrink-0 ${value ? "am-gradient" : "bg-[hsl(220,16%,13%)]"}`}>
      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300 ${value ? "left-6" : "left-0.5"}`} />
    </button>
  );

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="px-4 pt-4 pb-3">
        <h1 className="text-2xl font-bold font-['Montserrat'] am-gradient-text mb-4">Настройки</h1>
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-4">

        <div className="am-surface rounded-2xl p-4 am-glow">
          <div className="flex items-center gap-4">
            <Avatar initials={me.avatar_initials} color={me.avatar_color} size="lg" />
            <div>
              <div className="font-bold text-base text-white">{me.display_name}</div>
              <div className="text-sm text-cyan-400">@{me.username}</div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-4 bg-purple-500/10 border border-purple-500/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl am-gradient flex items-center justify-center">
              <Icon name="Cloud" size={18} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm text-white">Облачная синхронизация</div>
              <div className="text-xs text-[hsl(215,20%,50%)]">Все устройства в реальном времени</div>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-400 online-dot" />
            <span className="text-xs text-emerald-400">Активна</span>
          </div>
        </div>

        {[
          { title: "Уведомления", items: [
            { label: "Push-уведомления", icon: "Bell", value: notifications, toggle: () => setNotifications(v => !v) },
            { label: "Звук сообщений", icon: "Volume2", value: sound, toggle: () => setSound(v => !v) },
          ]},
          { title: "Конфиденциальность", items: [
            { label: "Двухфакторная защита", icon: "Shield", value: twoFactor, toggle: () => setTwoFactor(v => !v) },
          ]},
          { title: "Внешний вид", items: [
            { label: "Анимации", icon: "Sparkles", value: animations, toggle: () => setAnimations(v => !v) },
          ]},
        ].map(group => (
          <div key={group.title} className="am-surface rounded-2xl overflow-hidden">
            <div className="px-4 py-2 bg-[hsl(220,16%,13%)]">
              <p className="text-xs text-[hsl(215,20%,50%)] uppercase tracking-wider font-semibold">{group.title}</p>
            </div>
            {group.items.map((item, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3.5 border-t border-[hsl(220,16%,18%)]">
                <div className="w-8 h-8 rounded-lg bg-[hsl(220,16%,13%)] flex items-center justify-center">
                  <Icon name={item.icon} size={15} className="text-purple-400" />
                </div>
                <span className="flex-1 text-sm text-white">{item.label}</span>
                <Toggle value={item.value} onChange={item.toggle} />
              </div>
            ))}
          </div>
        ))}

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl am-surface hover:bg-red-500/10 transition-colors text-red-400"
        >
          <Icon name="LogOut" size={16} />
          <span className="text-sm font-medium">Выйти из аккаунта</span>
        </button>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function Index() {
  const [me, setMe] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [active, setActive] = useState("chats");
  const [chats, setChats] = useState<Chat[]>([]);
  const [chatsLoading, setChatsLoading] = useState(false);
  const [openChat, setOpenChat] = useState<Chat | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("am_token");
    if (!token) { setAuthLoading(false); return; }
    authApi.me().then(res => {
      if (res && !(res as Record<string, unknown>).error) setMe(res as unknown as User);
      else localStorage.removeItem("am_token");
      setAuthLoading(false);
    });
  }, []);

  const loadChats = useCallback(async () => {
    setChatsLoading(true);
    const data = await chatsApi.list();
    if (Array.isArray(data)) setChats(data as Chat[]);
    setChatsLoading(false);
  }, []);

  useEffect(() => {
    if (!me) return;
    loadChats();
    const interval = setInterval(loadChats, 5000);
    return () => clearInterval(interval);
  }, [me, loadChats]);

  const handleAuth = (user: User) => setMe(user);

  const handleLogout = async () => {
    await authApi.logout();
    localStorage.removeItem("am_token");
    setMe(null);
    setChats([]);
    setOpenChat(null);
  };

  const handleStartChat = async (userId: number) => {
    const res = await chatsApi.createDirect(userId);
    if (res.id) {
      await loadChats();
      setActive("chats");
      const newChats = await chatsApi.list();
      if (Array.isArray(newChats)) {
        setChats(newChats as Chat[]);
        const found = (newChats as Chat[]).find((c: Chat) => c.id === res.id);
        if (found) setOpenChat(found);
      }
    }
  };

  if (authLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[hsl(220,20%,6%)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl am-gradient flex items-center justify-center am-glow animate-pulse-glow">
            <span className="text-white font-black text-2xl font-['Montserrat']">A</span>
          </div>
          <Icon name="Loader" size={24} className="animate-spin text-purple-400" />
        </div>
      </div>
    );
  }

  if (!me) return <AuthScreen onAuth={handleAuth} />;

  const renderSection = () => {
    switch (active) {
      case "chats": return <ChatsSection chats={chats} loading={chatsLoading} onOpen={setOpenChat} onRefresh={loadChats} />;
      case "contacts": return <ContactsSection me={me} onStartChat={handleStartChat} />;
      case "statuses": return <StatusesSection />;
      case "calls": return <CallsSection />;
      case "search": return <SearchSection me={me} onStartChat={handleStartChat} />;
      case "settings": return <SettingsSection me={me} onLogout={handleLogout} />;
      default: return null;
    }
  };

  return (
    <div className="h-screen w-screen flex bg-[hsl(220,20%,6%)] overflow-hidden" style={{ fontFamily: "'Golos Text', sans-serif" }}>

      <nav className="w-16 flex flex-col items-center py-4 gap-1 border-r border-[hsl(220,16%,18%)] bg-[hsl(220,18%,9%)] flex-shrink-0 z-10">
        <div className="w-10 h-10 rounded-2xl am-gradient flex items-center justify-center am-glow mb-3 float">
          <span className="text-white font-bold text-sm font-['Montserrat']">A</span>
        </div>
        <div className="flex-1 flex flex-col items-center gap-1 w-full px-2">
          {NAV_ITEMS.map(item => {
            const totalUnread = item.id === "chats" ? chats.reduce((s, c) => s + (c.unread || 0), 0) : 0;
            return (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                title={item.label}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 relative group ${
                  active === item.id ? "am-gradient text-white am-glow scale-105" : "text-[hsl(215,20%,50%)] hover:bg-[hsl(220,16%,13%)] hover:text-white"
                }`}
              >
                <Icon name={item.icon} size={20} />
                {totalUnread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 flex items-center justify-center text-[9px] font-bold text-white">
                    {totalUnread > 99 ? "99+" : totalUnread}
                  </span>
                )}
                <div className="absolute left-14 bg-[hsl(220,18%,9%)] border border-[hsl(220,16%,18%)] text-white text-xs px-2.5 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  {item.label}
                </div>
              </button>
            );
          })}
        </div>
        <div onClick={() => setActive("settings")} className="cursor-pointer hover:scale-105 transition-transform mt-2">
          <Avatar initials={me.avatar_initials} color={me.avatar_color} size="sm" />
        </div>
      </nav>

      <div className="w-80 flex-shrink-0 border-r border-[hsl(220,16%,18%)] bg-[hsl(220,18%,9%)] flex flex-col overflow-hidden">
        {renderSection()}
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {openChat ? (
          <ChatWindow chat={openChat} me={me} onClose={() => setOpenChat(null)} onMessageSent={loadChats} />
        ) : (
          <div
            className="flex-1 flex flex-col items-center justify-center gap-6"
            style={{ backgroundImage: "radial-gradient(circle at 30% 70%, rgba(139,92,246,0.07) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(6,182,212,0.07) 0%, transparent 50%)" }}
          >
            <div className="w-24 h-24 rounded-3xl am-gradient flex items-center justify-center am-glow animate-pulse-glow float">
              <span className="text-white font-black text-3xl font-['Montserrat']">A</span>
            </div>
            <div className="text-center">
              <h2 className="text-3xl font-black font-['Montserrat'] am-gradient-text">AMessage</h2>
              <p className="text-[hsl(215,20%,50%)] text-sm mt-2">Привет, {me.display_name}!</p>
              <div className="flex items-center gap-2 justify-center mt-3 text-xs text-[hsl(215,20%,50%)]">
                <Icon name="Cloud" size={13} className="text-cyan-400" />
                <span>Синхронизация между всеми устройствами активна</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              {[{ label: "Шифрование", icon: "Lock" }, { label: "Облако", icon: "CloudLightning" }, { label: "Поиск", icon: "Zap" }].map((f, i) => (
                <div key={i} className="px-3 py-1.5 rounded-xl border border-[hsl(220,16%,18%)] text-xs text-[hsl(215,20%,50%)] flex items-center gap-1.5">
                  <Icon name={f.icon} size={11} className="text-purple-400" />
                  {f.label}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
