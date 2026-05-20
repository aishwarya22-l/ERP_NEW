const store = new Map(); // key → { value, expiresAt }

export const cacheGet = (key) => {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.value;
};

export const cacheSet = (key, value, ttlSeconds = 60) => {
  store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
};

export const cacheDel = (key) => store.delete(key);

export const cacheDelPattern = (prefix) => {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key);
  }
};
