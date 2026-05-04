import Constants from "expo-constants";
import { supabase } from "@/lib/supabase";

function resolveServerUrl(): string {
  const configured = process.env.EXPO_PUBLIC_SERVER_URL?.trim();
  if (!configured) {
    throw new Error(
      "Missing EXPO_PUBLIC_SERVER_URL. Set it in client/.env and restart Expo.",
    );
  }

  const url = new URL(configured);
  const isLocalHost =
    url.hostname === "localhost" || url.hostname === "127.0.0.1";
  if (!isLocalHost) {
    return url.toString().replace(/\/$/, "");
  }

  const expoHost =
    Constants.expoConfig?.hostUri?.split(":")[0] ??
    Constants.expoGoConfig?.debuggerHost?.split(":")[0] ??
    null;

  if (expoHost) {
    url.hostname = expoHost;
  }

  return url.toString().replace(/\/$/, "");
}

export const SERVER_URL = resolveServerUrl();

export class ApiError extends Error {
  status: number | null;

  constructor(message: string, status: number | null = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = "Your session has expired. Please sign in again.") {
    super(message, 401);
    this.name = "UnauthorizedError";
  }
}

export class NetworkError extends ApiError {
  constructor(message: string) {
    super(message, null);
    this.name = "NetworkError";
  }
}

async function getAccessToken(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) {
    throw new UnauthorizedError();
  }
  return token;
}

async function readErrorMessage(res: Response): Promise<string> {
  try {
    const text = await res.text();
    try {
      const data = JSON.parse(text) as { error?: string; message?: string };
      return data.error || data.message || `Request failed with ${res.status}`;
    } catch {
      return text || `Request failed with ${res.status}`;
    }
  } catch {
    return `Request failed with ${res.status}`;
  }
}

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
  accounts: {
    account_id: string;
    account_name: string;
    available: number;
    current: number;
    currency: string;
  }[];
};

async function api(path: string, init: RequestInit = {}): Promise<Response> {
  const token = await getAccessToken();

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);

  try {
    return await fetch(`${SERVER_URL}${path}`, { ...init, headers });
  } catch (err) {
    if (err instanceof TypeError) {
      throw new NetworkError(
        SERVER_URL.includes("localhost") || SERVER_URL.includes("127.0.0.1")
          ? "Could not reach the API server. If you're testing on a phone, use your Mac's LAN IP instead of localhost."
          : "Could not reach the API server. Check that the backend is running and reachable from the app.",
      );
    }
    throw err;
  }
}

export async function apiJson<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const res = await api(path, init);
  if (!res.ok) {
    const message = await readErrorMessage(res);
    if (res.status === 401) {
      throw new UnauthorizedError(message);
    }
    throw new ApiError(message, res.status);
  }
  if (res.status === 204) {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}

export function getErrorMessage(
  err: unknown,
  fallback: string = "Something went wrong. Please try again.",
): string {
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return fallback;
}

export async function fetchStatus(): Promise<{ connected: boolean }> {
  return apiJson<{ connected: boolean }>("/status");
}

export async function fetchBalance(): Promise<ApiBalance> {
  return apiJson<ApiBalance>("/balance");
}

export async function fetchTransactions(): Promise<ApiTransaction[]> {
  const data = await apiJson<{ transactions: ApiTransaction[] }>("/transactions");
  return data.transactions;
}

export async function disconnect(): Promise<void> {
  await apiJson<void>("/disconnect", { method: "POST" });
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
  return apiJson<Profile>("/profile");
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
  return apiJson<Profile>("/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
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
  const data = await apiJson<{ conversations: Conversation[] }>(
    "/chat/conversations",
  );
  return data.conversations;
}

export async function createConversation(
  title?: string,
): Promise<Conversation> {
  return apiJson<Conversation>("/chat/conversations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
}

export async function fetchMessages(
  conversationId: string,
): Promise<ChatMessage[]> {
  const data = await apiJson<{ messages: ChatMessage[] }>(
    `/chat/conversations/${conversationId}/messages`,
  );
  return data.messages;
}

export async function sendMessage(
  conversationId: string,
  content: string,
): Promise<ChatMessage> {
  return apiJson<ChatMessage>(`/chat/conversations/${conversationId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
}

export type AiInsights = {
  period?: "week" | "month";
  date_label?: string;
  range_label?: string;
  spent_today: {
    amount: number;
    percentage_vs_average: number;
  };
  top_category: {
    name: string;
    amount: number;
  };
  potential_savings: {
    amount: number;
    note: string;
  };
  thomo_quote: string;
  breakdown: {
    category: string;
    amount: number;
  }[];
  daily_intelligence: {
    date: string;
    spent: number;
    percentage_vs_usual: number;
    thomo_advice: string;
    breakdown: {
      category: string;
      amount: number;
    }[];
  }[];
  thomo_advice: string;
};

export async function fetchAiInsights(
  period: "week" | "month" = "week",
  refresh = false,
): Promise<AiInsights> {
  return apiJson<AiInsights>(
    `/ai/insights?period=${period}${refresh ? "&refresh=1" : ""}`,
  );
}

export async function deleteConversation(
  conversationId: string,
): Promise<void> {
  await apiJson<void>(`/chat/conversations/${conversationId}`, {
    method: "DELETE",
  });
}

/* ------------------------------- Finexer -------------------------------- */

export type FinexerConnectLink = {
  customer_id: string;
  consent_link_id: string;
  consent_url: string;
  cached: boolean;
};

export async function fetchFinexerConnectLink(): Promise<FinexerConnectLink> {
  return apiJson<FinexerConnectLink>("/finexer/connect-link", {
    method: "POST",
  });
}

export async function resetFinexer(): Promise<void> {
  await apiJson<void>("/finexer/reset", { method: "POST" });
}
