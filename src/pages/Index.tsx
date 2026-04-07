import { useState } from "react";
import Icon from "@/components/ui/icon";

const CHATS = [
  { id: 1, name: "Алина Морозова", avatar: "АМ", color: "from-purple-500 to-pink-500", msg: "Увидимся вечером?", time: "14:32", unread: 3, online: true },
  { id: 2, name: "Рабочий чат 🔥", avatar: "РЧ", color: "from-cyan-500 to-blue-500", msg: "Дедлайн перенесён на пятницу", time: "13:15", unread: 12, online: false },
  { id: 3, name: "Дмитрий Волков", avatar: "ДВ", color: "from-orange-400 to-red-500", msg: "Отправил файлы на почту", time: "12:00", unread: 0, online: true },
  { id: 4, name: "Семья ❤️", avatar: "С", color: "from-green-400 to-teal-500", msg: "Мама: Приедете в воскресенье?", time: "11:48", unread: 5, online: false },
  { id: 5, name: "Катя Лебедева", avatar: "КЛ", color: "from-violet-500 to-purple-600", msg: "Фотки с вечеринки 🎉", time: "вч", unread: 0, online: true },
  { id: 6, name: "Иван Петров", avatar: "ИП", color: "from-yellow-400 to-orange-500", msg: "Ок, договорились!", time: "вч", unread: 0, online: false },
  { id: 7, name: "Проект AMessage", avatar: "PA", color: "from-pink-500 to-rose-600", msg: "Новая версия задеплоена 🚀", time: "пн", unread: 0, online: true },
];

const MESSAGES = [
  { id: 1, from: "them", text: "Привет! Как дела?", time: "14:20", read: true },
  { id: 2, from: "me", text: "Отлично! Работаю над новым проектом", time: "14:21", read: true },
  { id: 3, from: "them", text: "О, звучит интересно! Расскажи подробнее", time: "14:22", read: true },
  { id: 4, from: "me", text: "Это мессенджер нового поколения — AMessage 🚀 Синхронизация между всеми устройствами, красивый дизайн!", time: "14:25", read: true },
  { id: 5, from: "them", text: "Вау, это круто! Хочу попробовать 😍", time: "14:28", read: true },
  { id: 6, from: "them", text: "Увидимся вечером?", time: "14:32", read: false },
];

const CONTACTS = [
  { id: 1, name: "Алина Морозова", status: "В сети", avatar: "АМ", color: "from-purple-500 to-pink-500", online: true },
  { id: 2, name: "Дмитрий Волков", status: "Был(а) 2 часа назад", avatar: "ДВ", color: "from-orange-400 to-red-500", online: false },
  { id: 3, name: "Иван Петров", status: "В сети", avatar: "ИП", color: "from-yellow-400 to-orange-500", online: true },
  { id: 4, name: "Катя Лебедева", status: "В сети", avatar: "КЛ", color: "from-violet-500 to-purple-600", online: true },
  { id: 5, name: "Максим Сидоров", status: "Был(а) вчера", avatar: "МС", color: "from-green-400 to-teal-500", online: false },
  { id: 6, name: "Ольга Смирнова", status: "Не беспокоить", avatar: "ОС", color: "from-blue-400 to-indigo-500", online: false },
];

const STATUSES = [
  { id: 1, name: "Моё", avatar: "Я", color: "from-purple-500 to-cyan-500", hasStatus: false, isMe: true, time: "" },
  { id: 2, name: "Алина", avatar: "АМ", color: "from-purple-500 to-pink-500", time: "14:30", hasStatus: true, isMe: false },
  { id: 3, name: "Катя", avatar: "КЛ", color: "from-violet-500 to-purple-600", time: "12:15", hasStatus: true, isMe: false },
  { id: 4, name: "Иван", avatar: "ИП", color: "from-yellow-400 to-orange-500", time: "11:00", hasStatus: true, isMe: false },
  { id: 5, name: "Проект", avatar: "PA", color: "from-pink-500 to-rose-600", time: "вчера", hasStatus: true, isMe: false },
];

const CALLS = [
  { id: 1, name: "Алина Морозова", avatar: "АМ", color: "from-purple-500 to-pink-500", type: "incoming", missed: false, time: "Сегодня 14:10", duration: "5:23" },
  { id: 2, name: "Рабочий чат", avatar: "РЧ", color: "from-cyan-500 to-blue-500", type: "video", missed: true, time: "Сегодня 11:30", duration: "" },
  { id: 3, name: "Дмитрий Волков", avatar: "ДВ", color: "from-orange-400 to-red-500", type: "outgoing", missed: false, time: "Вчера 20:00", duration: "12:45" },
  { id: 4, name: "Катя Лебедева", avatar: "КЛ", color: "from-violet-500 to-purple-600", type: "incoming", missed: true, time: "Вчера 18:22", duration: "" },
  { id: 5, name: "Иван Петров", avatar: "ИП", color: "from-yellow-400 to-orange-500", type: "video", missed: false, time: "Пн 15:00", duration: "45:12" },
];

const NAV_ITEMS = [
  { id: "chats", label: "Чаты", icon: "MessageCircle" },
  { id: "contacts", label: "Контакты", icon: "Users" },
  { id: "statuses", label: "Статусы", icon: "Circle" },
  { id: "calls", label: "Звонки", icon: "Phone" },
  { id: "search", label: "Поиск", icon: "Search" },
  { id: "settings", label: "Настройки", icon: "Settings" },
];

type Chat = typeof CHATS[0];

function Avatar({ initials, color, size = "md", online }: { initials: string; color: string; size?: "sm" | "md" | "lg"; online?: boolean }) {
  const sizes = { sm: "w-9 h-9 text-xs", md: "w-11 h-11 text-sm", lg: "w-14 h-14 text-base" };
  return (
    <div className="relative flex-shrink-0">
      <div className={`${sizes[size]} rounded-full bg-gradient-to-br ${color} flex items-center justify-center font-bold text-white`}>
        {initials}
      </div>
      {online !== undefined && (
        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[hsl(220,20%,6%)] online-dot ${online ? "bg-emerald-400" : "bg-gray-500"}`} />
      )}
    </div>
  );
}

function ChatsSection({ onOpen }: { onOpen: (chat: Chat) => void }) {
  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold font-['Montserrat'] am-gradient-text">Чаты</h1>
          <button className="w-9 h-9 rounded-full am-gradient flex items-center justify-center am-glow">
            <Icon name="Plus" size={18} className="text-white" />
          </button>
        </div>
        <div className="relative">
          <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(215,20%,50%)]" />
          <input
            placeholder="Поиск по чатам..."
            className="w-full bg-[hsl(220,16%,13%)] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-[hsl(215,20%,50%)] border border-[hsl(220,16%,18%)] focus:outline-none focus:border-purple-500/50 transition-colors"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5">
        {CHATS.map((chat, i) => (
          <button
            key={chat.id}
            onClick={() => onOpen(chat)}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl hover:bg-[hsl(220,16%,13%)] transition-all duration-200 text-left group"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <Avatar initials={chat.avatar} color={chat.color} online={chat.online} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-white truncate">{chat.name}</span>
                <span className="text-xs text-[hsl(215,20%,50%)] ml-2 flex-shrink-0">{chat.time}</span>
              </div>
              <div className="flex items-center justify-between mt-0.5">
                <span className="text-xs text-[hsl(215,20%,50%)] truncate">{chat.msg}</span>
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

function ChatWindow({ chat, onClose }: { chat: Chat; onClose: () => void }) {
  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState(MESSAGES);

  const send = () => {
    if (!msg.trim()) return;
    setMessages(prev => [...prev, {
      id: Date.now(),
      from: "me",
      text: msg,
      time: new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" }),
      read: false
    }]);
    setMsg("");
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="glass px-4 py-3 flex items-center gap-3 border-b border-[hsl(220,16%,18%)]">
        <button onClick={onClose} className="w-8 h-8 rounded-xl hover:bg-[hsl(220,16%,13%)] flex items-center justify-center transition-colors">
          <Icon name="ChevronLeft" size={20} className="text-[hsl(215,20%,50%)]" />
        </button>
        <Avatar initials={chat.avatar} color={chat.color} size="sm" online={chat.online} />
        <div className="flex-1">
          <div className="font-semibold text-sm text-white">{chat.name}</div>
          <div className="text-xs text-cyan-400">{chat.online ? "В сети" : "Был(а) недавно"}</div>
        </div>
        <div className="flex gap-2">
          <button className="w-8 h-8 rounded-xl hover:bg-[hsl(220,16%,13%)] flex items-center justify-center transition-colors">
            <Icon name="Phone" size={16} className="text-[hsl(215,20%,50%)]" />
          </button>
          <button className="w-8 h-8 rounded-xl hover:bg-[hsl(220,16%,13%)] flex items-center justify-center transition-colors">
            <Icon name="Video" size={16} className="text-[hsl(215,20%,50%)]" />
          </button>
          <button className="w-8 h-8 rounded-xl hover:bg-[hsl(220,16%,13%)] flex items-center justify-center transition-colors">
            <Icon name="MoreVertical" size={16} className="text-[hsl(215,20%,50%)]" />
          </button>
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
        style={{ backgroundImage: "radial-gradient(circle at 20% 80%, rgba(139,92,246,0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(6,182,212,0.05) 0%, transparent 50%)" }}
      >
        {messages.map((m, i) => (
          <div
            key={m.id}
            className={`flex ${m.from === "me" ? "justify-end" : "justify-start"} message-in`}
            style={{ animationDelay: `${i * 30}ms` }}
          >
            <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
              m.from === "me"
                ? "am-gradient text-white rounded-br-sm"
                : "bg-[hsl(220,16%,13%)] text-white rounded-bl-sm border border-[hsl(220,16%,18%)]"
            }`}>
              <p>{m.text}</p>
              <div className={`flex items-center gap-1 mt-1 ${m.from === "me" ? "justify-end" : "justify-start"}`}>
                <span className={`text-[10px] ${m.from === "me" ? "text-white/70" : "text-[hsl(215,20%,50%)]"}`}>{m.time}</span>
                {m.from === "me" && (
                  <Icon name={m.read ? "CheckCheck" : "Check"} size={12} className="text-white/70" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass px-4 py-3 border-t border-[hsl(220,16%,18%)]">
        <div className="flex items-center gap-2">
          <button className="w-9 h-9 rounded-xl hover:bg-[hsl(220,16%,13%)] flex items-center justify-center transition-colors flex-shrink-0">
            <Icon name="Paperclip" size={18} className="text-[hsl(215,20%,50%)]" />
          </button>
          <input
            value={msg}
            onChange={e => setMsg(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
            placeholder="Написать сообщение..."
            className="flex-1 bg-[hsl(220,16%,13%)] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-[hsl(215,20%,50%)] border border-[hsl(220,16%,18%)] focus:outline-none focus:border-purple-500/50 transition-colors"
          />
          <button className="w-9 h-9 rounded-xl hover:bg-[hsl(220,16%,13%)] flex items-center justify-center transition-colors flex-shrink-0">
            <Icon name="Smile" size={18} className="text-[hsl(215,20%,50%)]" />
          </button>
          <button
            onClick={send}
            className="w-10 h-10 rounded-xl am-gradient flex items-center justify-center am-glow flex-shrink-0 transition-transform active:scale-95"
          >
            <Icon name="Send" size={16} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ContactsSection() {
  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold font-['Montserrat'] am-gradient-text">Контакты</h1>
          <button className="w-9 h-9 rounded-full am-gradient flex items-center justify-center am-glow">
            <Icon name="UserPlus" size={18} className="text-white" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5">
        <div className="px-3 py-2 text-xs font-semibold text-[hsl(215,20%,50%)] uppercase tracking-wider">
          В сети — {CONTACTS.filter(c => c.online).length}
        </div>
        {CONTACTS.map((c, i) => (
          <div
            key={c.id}
            className="flex items-center gap-3 px-3 py-3 rounded-2xl hover:bg-[hsl(220,16%,13%)] transition-all duration-200 cursor-pointer animate-fade-in"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <Avatar initials={c.avatar} color={c.color} online={c.online} />
            <div className="flex-1">
              <div className="font-semibold text-sm text-white">{c.name}</div>
              <div className={`text-xs ${c.online ? "text-cyan-400" : "text-[hsl(215,20%,50%)]"}`}>{c.status}</div>
            </div>
            <div className="flex gap-1">
              <button className="w-8 h-8 rounded-xl hover:bg-[hsl(220,16%,18%)] flex items-center justify-center transition-colors">
                <Icon name="MessageCircle" size={15} className="text-[hsl(215,20%,50%)]" />
              </button>
              <button className="w-8 h-8 rounded-xl hover:bg-[hsl(220,16%,18%)] flex items-center justify-center transition-colors">
                <Icon name="Phone" size={15} className="text-[hsl(215,20%,50%)]" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusesSection() {
  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="px-4 pt-4 pb-3">
        <h1 className="text-2xl font-bold font-['Montserrat'] am-gradient-text mb-4">Статусы</h1>
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="mb-6">
          <p className="text-xs text-[hsl(215,20%,50%)] uppercase tracking-wider mb-3 font-semibold">Мой статус</p>
          <div className="flex items-center gap-4 cursor-pointer">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 p-0.5 animate-pulse-glow">
                <div className="w-full h-full rounded-full bg-[hsl(220,20%,6%)] flex items-center justify-center">
                  <Icon name="Plus" size={24} className="text-purple-400" />
                </div>
              </div>
            </div>
            <div>
              <div className="font-semibold text-sm text-white">Добавить статус</div>
              <div className="text-xs text-[hsl(215,20%,50%)]">Поделитесь моментом</div>
            </div>
          </div>
        </div>

        <p className="text-xs text-[hsl(215,20%,50%)] uppercase tracking-wider mb-3 font-semibold">Обновления</p>
        <div className="space-y-4">
          {STATUSES.filter(s => !s.isMe).map((s, i) => (
            <div
              key={s.id}
              className="flex items-center gap-4 cursor-pointer group animate-fade-in"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${s.color} p-0.5`}>
                <div className="w-full h-full rounded-full bg-[hsl(220,20%,6%)] flex items-center justify-center font-bold text-sm text-white">
                  {s.avatar}
                </div>
              </div>
              <div>
                <div className="font-semibold text-sm text-white">{s.name}</div>
                <div className="text-xs text-[hsl(215,20%,50%)]">{s.time}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <p className="text-xs text-[hsl(215,20%,50%)] uppercase tracking-wider mb-3 font-semibold">Лента</p>
          <div className="grid grid-cols-3 gap-2">
            {["from-purple-600 to-pink-500", "from-cyan-500 to-blue-600", "from-orange-400 to-red-500", "from-green-400 to-teal-500", "from-violet-500 to-indigo-600", "from-yellow-400 to-orange-400"].map((g, i) => (
              <div
                key={i}
                className={`aspect-square rounded-2xl bg-gradient-to-br ${g} flex items-center justify-center cursor-pointer hover:scale-105 transition-transform`}
              >
                <Icon name="Image" size={24} className="text-white/50" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CallsSection() {
  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold font-['Montserrat'] am-gradient-text">Звонки</h1>
          <button className="w-9 h-9 rounded-full am-gradient flex items-center justify-center am-glow">
            <Icon name="PhoneCall" size={18} className="text-white" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5">
        {CALLS.map((call, i) => (
          <div
            key={call.id}
            className="flex items-center gap-3 px-3 py-3 rounded-2xl hover:bg-[hsl(220,16%,13%)] transition-all duration-200 cursor-pointer animate-fade-in"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <Avatar initials={call.avatar} color={call.color} />
            <div className="flex-1">
              <div className="font-semibold text-sm text-white">{call.name}</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Icon
                  name={call.type === "video" ? "Video" : call.type === "incoming" ? "PhoneIncoming" : "PhoneOutgoing"}
                  size={12}
                  className={call.missed ? "text-red-400" : "text-cyan-400"}
                />
                <span className={`text-xs ${call.missed ? "text-red-400" : "text-[hsl(215,20%,50%)]"}`}>
                  {call.missed ? "Пропущенный" : call.duration} · {call.time}
                </span>
              </div>
            </div>
            <button className="w-9 h-9 rounded-xl hover:bg-[hsl(220,16%,13%)] flex items-center justify-center transition-colors">
              <Icon
                name={call.type === "video" ? "Video" : "Phone"}
                size={16}
                className={call.type === "video" ? "text-cyan-400" : "text-purple-400"}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function SearchSection() {
  const [query, setQuery] = useState("");
  const results = query.length > 1
    ? [
        ...CHATS.filter(c => c.name.toLowerCase().includes(query.toLowerCase())).map(c => ({ ...c, sub: c.msg })),
        ...CONTACTS.filter(c => c.name.toLowerCase().includes(query.toLowerCase())).map(c => ({ ...c, sub: c.status, unread: 0, time: "", online: c.online, msg: c.status })),
      ]
    : [];

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="px-4 pt-4 pb-3">
        <h1 className="text-2xl font-bold font-['Montserrat'] am-gradient-text mb-4">Поиск</h1>
        <div className="relative">
          <Icon name="Search" size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Люди, сообщения, файлы..."
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
              <p className="text-sm text-[hsl(215,20%,50%)] mt-1">Найдите людей, чаты и сообщения</p>
            </div>
          </div>
        )}
        {query.length > 0 && results.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 pb-20">
            <Icon name="SearchX" size={40} className="text-[hsl(215,20%,50%)]" />
            <p className="text-[hsl(215,20%,50%)]">Ничего не найдено</p>
          </div>
        )}
        {results.map((r, i) => (
          <div
            key={`${r.id}-${i}`}
            className="flex items-center gap-3 py-3 border-b border-[hsl(220,16%,18%)] animate-fade-in cursor-pointer hover:bg-[hsl(220,16%,13%)] rounded-xl px-2 -mx-2"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <Avatar initials={r.avatar} color={r.color} />
            <div>
              <div className="font-semibold text-sm text-white">{r.name}</div>
              <div className="text-xs text-[hsl(215,20%,50%)]">{r.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsSection() {
  const [notifications, setNotifications] = useState(true);
  const [cloudSync, setCloudSync] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);
  const [sound, setSound] = useState(true);
  const [hideOnline, setHideOnline] = useState(false);
  const [animations, setAnimations] = useState(true);

  const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`relative w-12 h-6 rounded-full transition-all duration-300 flex-shrink-0 ${value ? "am-gradient" : "bg-[hsl(220,16%,13%)]"}`}
    >
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
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center font-bold text-xl text-white">
              Я
            </div>
            <div>
              <div className="font-bold text-base text-white">Мой профиль</div>
              <div className="text-sm text-cyan-400">@username</div>
              <div className="text-xs text-[hsl(215,20%,50%)] mt-0.5">+7 (999) 123-45-67</div>
            </div>
            <button className="ml-auto w-9 h-9 rounded-xl hover:bg-[hsl(220,16%,13%)] flex items-center justify-center">
              <Icon name="Edit3" size={16} className="text-[hsl(215,20%,50%)]" />
            </button>
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
            <Toggle value={cloudSync} onChange={() => setCloudSync(!cloudSync)} />
          </div>
        </div>

        {[
          { title: "Уведомления", items: [
            { label: "Push-уведомления", icon: "Bell", value: notifications, toggle: () => setNotifications(v => !v) },
            { label: "Звук сообщений", icon: "Volume2", value: sound, toggle: () => setSound(v => !v) },
          ]},
          { title: "Конфиденциальность", items: [
            { label: "Двухфакторная защита", icon: "Shield", value: twoFactor, toggle: () => setTwoFactor(v => !v) },
            { label: "Скрыть онлайн-статус", icon: "EyeOff", value: hideOnline, toggle: () => setHideOnline(v => !v) },
          ]},
          { title: "Внешний вид", items: [
            { label: "Тёмная тема", icon: "Moon", value: darkMode, toggle: () => setDarkMode(v => !v) },
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

        <button className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl am-surface hover:bg-[hsl(220,16%,13%)] transition-colors text-red-400">
          <Icon name="LogOut" size={16} />
          <span className="text-sm font-medium">Выйти из аккаунта</span>
        </button>
      </div>
    </div>
  );
}

export default function Index() {
  const [active, setActive] = useState<string>("chats");
  const [openChat, setOpenChat] = useState<Chat | null>(null);

  const renderSection = () => {
    switch (active) {
      case "chats": return <ChatsSection onOpen={(c) => setOpenChat(c)} />;
      case "contacts": return <ContactsSection />;
      case "statuses": return <StatusesSection />;
      case "calls": return <CallsSection />;
      case "search": return <SearchSection />;
      case "settings": return <SettingsSection />;
      default: return null;
    }
  };

  return (
    <div className="h-screen w-screen flex bg-[hsl(220,20%,6%)] overflow-hidden" style={{ fontFamily: "'Golos Text', sans-serif" }}>

      {/* Sidebar nav */}
      <nav className="w-16 flex flex-col items-center py-4 gap-1 border-r border-[hsl(220,16%,18%)] bg-[hsl(220,18%,9%)] flex-shrink-0 z-10">
        <div className="w-10 h-10 rounded-2xl am-gradient flex items-center justify-center am-glow mb-3 float">
          <span className="text-white font-bold text-sm font-['Montserrat']">A</span>
        </div>

        <div className="flex-1 flex flex-col items-center gap-1 w-full px-2">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              title={item.label}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 relative group ${
                active === item.id
                  ? "am-gradient text-white am-glow scale-105"
                  : "text-[hsl(215,20%,50%)] hover:bg-[hsl(220,16%,13%)] hover:text-white"
              }`}
            >
              <Icon name={item.icon} size={20} />
              <div className="absolute left-14 bg-[hsl(220,18%,9%)] border border-[hsl(220,16%,18%)] text-white text-xs px-2.5 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                {item.label}
              </div>
            </button>
          ))}
        </div>

        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center font-bold text-white text-sm cursor-pointer hover:scale-105 transition-transform mt-2">
          Я
        </div>
      </nav>

      {/* Left panel */}
      <div className="w-80 flex-shrink-0 border-r border-[hsl(220,16%,18%)] bg-[hsl(220,18%,9%)] flex flex-col overflow-hidden">
        {renderSection()}
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {openChat ? (
          <ChatWindow chat={openChat} onClose={() => setOpenChat(null)} />
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
              <p className="text-[hsl(215,20%,50%)] text-sm mt-2">Мессенджер нового поколения</p>
              <div className="flex items-center gap-2 justify-center mt-3 text-xs text-[hsl(215,20%,50%)]">
                <Icon name="Cloud" size={13} className="text-cyan-400" />
                <span>Синхронизация между всеми устройствами</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 justify-center mt-2 max-w-md">
              {[
                { label: "Сквозное шифрование", icon: "Lock" },
                { label: "Облако", icon: "CloudLightning" },
                { label: "Быстрый поиск", icon: "Zap" },
              ].map((f, i) => (
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
