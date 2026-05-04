import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/lib/auth-context";
import {
  getErrorMessage,
  disconnect as apiDisconnect,
  fetchBalance,
  fetchStatus,
  fetchTransactions,
  fetchProfile,
  type ApiBalance,
  type ApiTransaction,
  type Profile,
} from "@/lib/api";
import { calculateVatLiability, type VatBreakdown } from "@/lib/vat";

type ThomoState = {
  connected: boolean | null;
  statusLoading: boolean;

  balance: ApiBalance | null;
  transactions: ApiTransaction[];
  profile: Profile | null;
  vat: VatBreakdown | null;

  balanceLoading: boolean;
  transactionsLoading: boolean;
  refreshing: boolean;
  error: string | null;

  refresh: () => Promise<void>;
  markConnected: () => Promise<void>;
  disconnect: () => Promise<void>;
};

const ThomoContext = createContext<ThomoState | null>(null);

export function ThomoProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const userId = user?.id ?? null;
  const [connected, setConnected] = useState<boolean | null>(null);
  const [statusUserId, setStatusUserId] = useState<string | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [balance, setBalance] = useState<ApiBalance | null>(null);
  const [transactions, setTransactions] = useState<ApiTransaction[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBalance = useCallback(async () => {
    setBalanceLoading(true);
    try {
      const bal = await fetchBalance();
      setBalance(bal);
    } catch (err) {
      console.error("Balance load failed:", err);
      setError(getErrorMessage(err, "Could not load your balance."));
    } finally {
      setBalanceLoading(false);
    }
  }, []);

  const loadTransactions = useCallback(async () => {
    setTransactionsLoading(true);
    try {
      const txs = await fetchTransactions();
      setTransactions(txs);
    } catch (err) {
      console.error("Transactions load failed:", err);
      setError(getErrorMessage(err, "Could not load transactions."));
    } finally {
      setTransactionsLoading(false);
    }
  }, []);

  const loadProfile = useCallback(async () => {
    try {
      const prof = await fetchProfile();
      setProfile(prof);
    } catch (err) {
      console.error("Profile load failed:", err);
    }
  }, []);

  const loadAll = useCallback(async () => {
    setError(null);
    setStatusLoading(true);
    try {
      const { connected: isConnected } = await fetchStatus();
      setConnected(isConnected);
      setStatusUserId(userId);

      if (isConnected) {
        await Promise.all([loadBalance(), loadTransactions(), loadProfile()]);
      } else {
        setBalance(null);
        setTransactions([]);
        setProfile(null);
      }
    } catch (err) {
      console.error("ThomoContext load failed:", err);
      setConnected(null);
      setStatusUserId(null);
      setBalance(null);
      setTransactions([]);
      setError(getErrorMessage(err, "Could not load your bank data."));
    } finally {
      setStatusLoading(false);
    }
  }, [loadBalance, loadTransactions, loadProfile, userId]);

  // Re-fetch when the authenticated user changes (sign-in, sign-out, switch)
  useEffect(() => {
    if (authLoading) return; // Auth still resolving — don't touch state yet

    if (!userId) {
      // Definitively signed out — clear everything
      setConnected(null);
      setStatusUserId(null);
      setStatusLoading(false);
      setBalance(null);
      setTransactions([]);
      setProfile(null);
      setError(null);
      return;
    }
    loadAll();
  }, [userId, authLoading, loadAll]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    setStatusLoading(true);
    try {
      const { connected: isConnected } = await fetchStatus();
      setConnected(isConnected);
      setStatusUserId(userId);
      if (isConnected) {
        await Promise.all([loadBalance(), loadTransactions(), loadProfile()]);
      } else {
        setBalance(null);
        setTransactions([]);
        setProfile(null);
      }
    } catch (err) {
      console.error("Refresh failed:", err);
      setConnected(null);
      setStatusUserId(null);
      setBalance(null);
      setTransactions([]);
      setError(getErrorMessage(err, "Could not refresh your bank data."));
    } finally {
      setStatusLoading(false);
      setRefreshing(false);
    }
  }, [loadBalance, loadTransactions, loadProfile, userId]);

  const markConnected = useCallback(async () => {
    setConnected(true);
    setStatusUserId(userId);
    loadBalance();
    loadTransactions();
  }, [loadBalance, loadTransactions, userId]);

  const disconnect = useCallback(async () => {
    await apiDisconnect();
    setConnected(false);
    setStatusUserId(userId);
    setBalance(null);
    setTransactions([]);
    setError(null);
  }, [userId]);

  const effectiveConnected = statusUserId === userId ? connected : null;

  const vat = useMemo(
    () =>
      transactions.length > 0 ? calculateVatLiability(transactions) : null,
    [transactions],
  );

  const value = useMemo<ThomoState>(
    () => ({
      connected: effectiveConnected,
      statusLoading,
      balance,
      transactions,
      profile,
      vat,
      balanceLoading,
      transactionsLoading,
      refreshing,
      error,
      refresh,
      markConnected,
      disconnect,
    }),
    [
      effectiveConnected,
      statusLoading,
      balance,
      transactions,
      profile,
      vat,
      balanceLoading,
      transactionsLoading,
      refreshing,
      error,
      refresh,
      markConnected,
      disconnect,
    ],
  );

  return (
    <ThomoContext.Provider value={value}>{children}</ThomoContext.Provider>
  );
}

export function useThomo(): ThomoState {
  const ctx = useContext(ThomoContext);
  if (!ctx) {
    throw new Error("useThomo must be used within ThomoProvider");
  }
  return ctx;
}
