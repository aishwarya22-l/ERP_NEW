/**
 * SSE connection manager.
 * Maintains a Map<userId, Set<res>> so we can push events to specific users.
 */

const clients = new Map();

export const addClient = (userId, res) => {
  const key = String(userId);
  if (!clients.has(key)) clients.set(key, new Set());
  clients.get(key).add(res);
};

export const removeClient = (userId, res) => {
  const key = String(userId);
  clients.get(key)?.delete(res);
  if (clients.get(key)?.size === 0) clients.delete(key);
};

/** Push an event to all open connections for a single user. */
export const notifyUser = (userId, event, data) => {
  const key     = String(userId);
  const conns   = clients.get(key);
  if (!conns?.size) return;
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const res of conns) {
    try { res.write(payload); } catch { conns.delete(res); }
  }
};

/** Broadcast an event to every connected user. */
export const broadcast = (event, data) => {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const conns of clients.values()) {
    for (const res of conns) {
      try { res.write(payload); } catch { conns.delete(res); }
    }
  }
};
