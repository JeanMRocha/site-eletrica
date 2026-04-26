import { Session, defaultSession } from './workspace';

export type UserProfile = {
  email: string;
  passwordHash: string; // Simplificado para simulação offline
  name?: string;
  image?: string;
};

const USERS_KEY = 'electrica.users';
const CURRENT_USER_KEY = 'electrica.session';

function getUsers(): UserProfile[] {
  const raw = localStorage.getItem(USERS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function findUserByEmail(email: string): UserProfile | undefined {
  return getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
}

export function registerUser(email: string, passwordHash: string): UserProfile {
  const users = getUsers();
  const newUser: UserProfile = { email, passwordHash };
  localStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]));
  return newUser;
}

export function createSessionFromUser(user: UserProfile): Session {
  const session: Session = {
    name: String(user.name || user.email.split('@')[0]),
    image: String(user.image || ''),
  };
  persistSession(session);
  return session;
}

export function persistSession(session: Session) {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(CURRENT_USER_KEY);
}

export function loadSession(): Session {
  const raw = localStorage.getItem(CURRENT_USER_KEY);
  if (!raw) return defaultSession;
  try {
    return JSON.parse(raw);
  } catch {
    return defaultSession;
  }
}
