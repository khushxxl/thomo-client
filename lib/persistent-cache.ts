import AsyncStorage from "@react-native-async-storage/async-storage";

type CacheEnvelope<T> = {
  value: T;
  savedAt: number;
};

export async function readPersistentCache<T>(
  key: string,
  maxAgeMs: number,
): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as CacheEnvelope<T>;
    if (!parsed || typeof parsed.savedAt !== "number" || !("value" in parsed)) {
      await AsyncStorage.removeItem(key);
      return null;
    }

    if (Date.now() - parsed.savedAt > maxAgeMs) {
      return null;
    }

    return parsed.value;
  } catch (error) {
    console.warn("Failed to read persistent cache:", error);
    return null;
  }
}

export async function writePersistentCache<T>(
  key: string,
  value: T,
): Promise<void> {
  try {
    const envelope: CacheEnvelope<T> = {
      value,
      savedAt: Date.now(),
    };
    await AsyncStorage.setItem(key, JSON.stringify(envelope));
  } catch (error) {
    console.warn("Failed to write persistent cache:", error);
  }
}

export async function removePersistentCache(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.warn("Failed to remove persistent cache:", error);
  }
}
