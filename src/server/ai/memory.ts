/**
 * PersonalOS AI Agent — Session Memory
 *
 * In-memory conversation store for AI sessions.
 * MVP uses an in-memory Map; production will migrate to Redis.
 */

export interface ChatMessage {
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  timestamp: Date;
  toolName?: string;
  toolResult?: unknown;
}

export interface Session {
  id: string;
  userId: string;
  agentRole: string;
  messages: ChatMessage[];
  createdAt: Date;
  lastActiveAt: Date;
  metadata: Record<string, unknown>;
}

// In-memory session store (to be replaced with Redis in production)
const sessions = new Map<string, Session>();

const MAX_SESSION_AGE_MS = 30 * 60 * 1000; // 30 minutes
const MAX_MESSAGES_PER_SESSION = 50;

/** Create a new session */
export function createSession(
  userId: string,
  agentRole: string,
  systemMessage?: string,
): Session {
  const id = `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const session: Session = {
    id,
    userId,
    agentRole,
    messages: systemMessage
      ? [
          {
            role: "system",
            content: systemMessage,
            timestamp: new Date(),
          },
        ]
      : [],
    createdAt: new Date(),
    lastActiveAt: new Date(),
    metadata: {},
  };

  sessions.set(id, session);
  return session;
}

/** Get an existing session */
export function getSession(sessionId: string): Session | null {
  const session = sessions.get(sessionId);
  if (!session) return null;

  // Check expiry
  if (Date.now() - session.lastActiveAt.getTime() > MAX_SESSION_AGE_MS) {
    sessions.delete(sessionId);
    return null;
  }

  return session;
}

/** Add a message to a session */
export function addMessage(
  sessionId: string,
  message: Omit<ChatMessage, "timestamp">,
): void {
  const session = sessions.get(sessionId);
  if (!session) return;

  session.messages.push({ ...message, timestamp: new Date() });
  session.lastActiveAt = new Date();

  // Trim old messages if exceeding limit
  if (session.messages.length > MAX_MESSAGES_PER_SESSION) {
    // Keep system message + recent messages
    const systemMsgs = session.messages.filter((m) => m.role === "system");
    const recentMsgs = session.messages
      .filter((m) => m.role !== "system")
      .slice(-MAX_MESSAGES_PER_SESSION + systemMsgs.length);
    session.messages = [...systemMsgs, ...recentMsgs];
  }
}

/** Get conversation history for prompt assembly */
export function getHistory(sessionId: string): ChatMessage[] {
  const session = sessions.get(sessionId);
  return session?.messages ?? [];
}

/** Clean up expired sessions */
export function cleanExpiredSessions(): number {
  const now = Date.now();
  let cleaned = 0;
  for (const [id, session] of sessions) {
    if (now - session.lastActiveAt.getTime() > MAX_SESSION_AGE_MS) {
      sessions.delete(id);
      cleaned++;
    }
  }
  return cleaned;
}

/** Delete a specific session */
export function deleteSession(sessionId: string): void {
  sessions.delete(sessionId);
}
