// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApiResponse = any;

const URLS = {
  auth: "https://functions.poehali.dev/e7d3d95d-291a-4a3e-b137-2180e19ff5b9",
  chats: "https://functions.poehali.dev/0ea87eae-0196-49d2-8eed-046289af1f42",
  messages: "https://functions.poehali.dev/21f185f7-c5f5-4082-8759-a797b503e6be",
};

function getToken(): string {
  return localStorage.getItem("am_token") || "";
}

async function post(url: string, body: object): Promise<ApiResponse> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Auth-Token": getToken() },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function get(url: string, params?: Record<string, string>): Promise<ApiResponse> {
  const u = params ? `${url}?${new URLSearchParams(params)}` : url;
  const res = await fetch(u, {
    headers: { "X-Auth-Token": getToken() },
  });
  return res.json();
}

// Auth
export const authApi = {
  register: (username: string, display_name: string, password: string) =>
    post(URLS.auth, { action: "register", username, display_name, password }),
  login: (username: string, password: string) =>
    post(URLS.auth, { action: "login", username, password }),
  logout: () => post(URLS.auth, { action: "logout", token: getToken() }),
  me: () => get(URLS.auth),
  search: (q: string) => post(URLS.auth, { action: "search", q }),
};

// Chats
export const chatsApi = {
  list: () => get(URLS.chats),
  createDirect: (user_id: number) => post(URLS.chats, { action: "create", user_id }),
  createGroup: (name: string, members: number[]) => post(URLS.chats, { action: "create", name, members }),
};

// Messages
export const messagesApi = {
  list: (chat_id: number) => get(URLS.messages, { action: "list", chat_id: String(chat_id) }),
  send: (chat_id: number, text: string) => post(URLS.messages, { action: "send", chat_id, text }),
};
