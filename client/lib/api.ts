import { supabase } from "@/lib/supabase";

export const SERVER_URL = process.env.EXPO_PUBLIC_SERVER_URL;

export type ApiTransaction = {
  transaction_id: string;
  account_id: string;
  account_name: string;
  description: string;
  merchant_name?: string;
  amount: number;
  currency: string;
  timestamp: string;
  transaction_type: string;
  transaction_category?: string;
};

export type ApiBalance = {
  total_available: number;
  total_current: number;
  currency: string;
  accounts: Array<{
    account_id: string;
    account_name: string;
    available: number;
    current: number;
    currency: string;
  }>;
};

/**
 * Tiny fetch wrapper that attaches the current Supabase session token as a
 * Bearer header so the server can identify the user. Falls through silently
 * when there's no session — the server's DEV_USER_ID fallback picks up dev.
 */
async function api(path: string, init: RequestInit = {}): Promise<Response> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);

  return fetch(`${SERVER_URL}${path}`, { ...init, headers });
}

export async function fetchStatus(): Promise<{ connected: boolean }> {
  const res = await api("/status");
  if (!res.ok) throw new Error("Failed to fetch status");
  return res.json();
}

export async function fetchBalance(): Promise<ApiBalance> {
  const res = await api("/balance");
  if (!res.ok) throw new Error("Failed to fetch balance");
  return res.json();
}

export async function fetchTransactions(): Promise<ApiTransaction[]> {
  const res = await api("/transactions");
  if (!res.ok) throw new Error("Failed to fetch transactions");
  const data = (await res.json()) as { transactions: ApiTransaction[] };
  return data.transactions;
}

export async function disconnect(): Promise<void> {
  await api("/disconnect", { method: "POST" });
}

/* -------------------------------- Profile -------------------------------- */

export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  business_name: string | null;
  business_type: string | null;
  currency: string;
  onboarded: boolean;
  created_at: string;
  updated_at: string;
};

export async function fetchProfile(): Promise<Profile> {
  const res = await api("/profile");
  if (!res.ok) throw new Error("Failed to fetch profile");
  return res.json();
}

export async function updateProfile(
  updates: Partial<
    Pick<
      Profile,
      | "full_name"
      | "phone"
      | "avatar_url"
      | "business_name"
      | "business_type"
      | "currency"
      | "onboarded"
    >
  >,
): Promise<Profile> {
  const res = await api("/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error("Failed to update profile");
  return res.json();
}

/* --------------------------------- Chat --------------------------------- */

export type Conversation = {
  id: string;
  title: string | null;
  updated_at: string;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

export async function fetchConversations(): Promise<Conversation[]> {
  const res = await api("/chat/conversations");
  if (!res.ok) throw new Error("Failed to fetch conversations");
  const data = (await res.json()) as { conversations: Conversation[] };
  return data.conversations;
}

export async function createConversation(
  title?: string,
): Promise<Conversation> {
  const res = await api("/chat/conversations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error("Failed to create conversation");
  return res.json();
}

export async function fetchMessages(
  conversationId: string,
): Promise<ChatMessage[]> {
  const res = await api(`/chat/conversations/${conversationId}/messages`);
  if (!res.ok) throw new Error("Failed to fetch messages");
  const data = (await res.json()) as { messages: ChatMessage[] };
  return data.messages;
}

export async function sendMessage(
  conversationId: string,
  content: string,
): Promise<ChatMessage> {
  const res = await api(`/chat/conversations/${conversationId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error("Failed to send message");
  return res.json();
}

export async function deleteConversation(
  conversationId: string,
): Promise<void> {
  await api(`/chat/conversations/${conversationId}`, { method: "DELETE" });
}

/* ------------------------------- Finexer -------------------------------- */

export type FinexerConnectLink = {
  customer_id: string;
  consent_link_id: string;
  consent_url: string;
  cached: boolean;
};

export async function fetchFinexerConnectLink(): Promise<FinexerConnectLink> {
  const res = await api("/finexer/connect-link", { method: "POST" });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Finexer connect-link failed: ${text}`);
  }
  return res.json();
}

export async function resetFinexer(): Promise<void> {
  await api("/finexer/reset", { method: "POST" });
}
