import { randomBytes } from 'node:crypto';

export interface SessionRecord {
  id: string;
  userId: string;
  expiresAt: Date;
}

const sessions = new Map<string, SessionRecord>();

export function createSession(userId: string, ttlMs = 1000 * 60 * 60 * 24 * 7): SessionRecord {
  const session: SessionRecord = {
    id: randomBytes(32).toString('hex'),
    userId,
    expiresAt: new Date(Date.now() + ttlMs),
  };
  sessions.set(session.id, session);
  return session;
}

export function getSession(id: string): SessionRecord | null {
  const session = sessions.get(id);
  if (!session || session.expiresAt.getTime() <= Date.now()) {
    if (session) sessions.delete(id);
    return null;
  }
  return session;
}

export function revokeSession(id: string): void {
  sessions.delete(id);
}

export function clearExpiredSessions(): void {
  const now = Date.now();
  for (const [id, session] of sessions) {
    if (session.expiresAt.getTime() <= now) sessions.delete(id);
  }
}
