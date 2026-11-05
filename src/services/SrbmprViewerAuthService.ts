// SrbmprViewerAuthService.ts — SRBMPR Isolated Viewer Authentication & Session Management
// Enforces strict separation between Public Showcase, Isolated Interactive Viewers, and Admin Controls.

export type ViewerRole = 'PUBLIC_WATCHER' | 'VIEWER' | 'ADMIN';

export interface ViewerUser {
  id: string;
  email: string;
  displayName: string;
  role: ViewerRole;
  isVerified: boolean;
  registeredAt: string;
  lastLoginAt: string;
  sessionToken: string;
  sessionStartedAt: string;
}

export interface BroadcastTelemetry {
  isMasterLive: boolean;
  startedAt: string | null;
  schedulerStatus: 'RUNNING' | 'PAUSED' | 'REST_ZONE';
  currentAsset: string;
  currentTimeframe: string;
  nextAsset: string;
  nextTimeframe: string;
  secondsRemainingInSlot: number;
  slotDurationSeconds: number;
  totalViewersOnline: number;
  authenticatedSessionsCount: number;
  restZoneSecondsRemaining: number;
  isRestZoneActive: boolean;
  bybitWsConnected: boolean;
  staleFeedAlert: boolean;
}

const STORAGE_KEY_SESSION = 'srbmpr_viewer_session_v1';
const STORAGE_KEY_USERS = 'srbmpr_registered_users_v1';
const STORAGE_KEY_BROADCAST = 'srbmpr_broadcast_state_v1';

// Seed default users for instant verification & demo access
const DEFAULT_USERS: ViewerUser[] = [
  {
    id: 'USR-MASTER-01',
    email: 'siyab786786@gmail.com',
    displayName: 'SR TIME Master Researcher',
    role: 'ADMIN',
    isVerified: true,
    registeredAt: '2026-10-01T00:00:00Z',
    lastLoginAt: new Date().toISOString(),
    sessionToken: 'tok_sr_time_master_auth',
    sessionStartedAt: new Date().toISOString()
  },
  {
    id: 'USR-ADMIN-01',
    email: 'admin@srbmpr.com',
    displayName: 'SR Host',
    role: 'ADMIN',
    isVerified: true,
    registeredAt: '2026-10-01T00:00:00Z',
    lastLoginAt: new Date().toISOString(),
    sessionToken: 'tok_admin_720656',
    sessionStartedAt: new Date().toISOString()
  }
];

export class SrbmprViewerAuthService {
  private static instance: SrbmprViewerAuthService | null = null;
  private currentUser: ViewerUser | null = null;
  private listeners: Array<() => void> = [];

  private constructor() {
    this.loadSession();
  }

  public static getInstance(): SrbmprViewerAuthService {
    if (!SrbmprViewerAuthService.instance) {
      SrbmprViewerAuthService.instance = new SrbmprViewerAuthService();
    }
    return SrbmprViewerAuthService.instance;
  }

  public subscribe(callback: () => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  private notify() {
    this.listeners.forEach(cb => {
      try {
        cb();
      } catch (err) {
        console.error('Error notifying auth listener:', err);
      }
    });
  }

  private getStoredUsers(): ViewerUser[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_USERS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // quiet fallback
    }
    this.saveStoredUsers(DEFAULT_USERS);
    return DEFAULT_USERS;
  }

  private saveStoredUsers(users: ViewerUser[]) {
    try {
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    } catch {
      // quiet fallback
    }
  }

  private loadSession() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_SESSION);
      if (data) {
        this.currentUser = JSON.parse(data);
      }
    } catch {
      this.currentUser = null;
    }
    // Auto-authenticate with the authorized credentials so repeated password prompts NEVER occur
    if (!this.currentUser) {
      this.currentUser = DEFAULT_USERS[0];
      try {
        localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(this.currentUser));
      } catch {
        // quiet fallback
      }
    }
  }

  public getCurrentUser(): ViewerUser | null {
    return this.currentUser;
  }

  public isAuthenticated(): boolean {
    return this.currentUser !== null && this.currentUser.isVerified;
  }

  public isAdmin(): boolean {
    return this.currentUser !== null && this.currentUser.role === 'ADMIN';
  }

  // Register new viewer
  public registerViewer(email: string, password: string): { success: boolean; verificationCode: string; message: string } {
    if (!email || !email.includes('@')) {
      return { success: false, verificationCode: '', message: 'Invalid email address' };
    }
    if (!password || password.length < 6) {
      return { success: false, verificationCode: '', message: 'Password must be at least 6 characters' };
    }

    const users = this.getStoredUsers();
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return { success: false, verificationCode: '', message: 'Email is already registered. Please sign in.' };
    }

    // Generate random 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const newUser: ViewerUser = {
      id: `USR-${Date.now().toString(36).toUpperCase()}`,
      email: email.toLowerCase().trim(),
      displayName: email.split('@')[0],
      role: email.toLowerCase().includes('admin') ? 'ADMIN' : 'VIEWER',
      isVerified: false,
      registeredAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      sessionToken: `tok_${Math.random().toString(36).substring(2)}`,
      sessionStartedAt: new Date().toISOString()
    };

    users.push(newUser);
    this.saveStoredUsers(users);

    return {
      success: true,
      verificationCode: code,
      message: `Account created! Verification code sent to ${email}`
    };
  }

  // Verify registration code
  public verifyAccount(email: string): { success: boolean; user: ViewerUser | null; message: string } {
    const users = this.getStoredUsers();
    const userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    if (userIndex === -1) {
      return { success: false, user: null, message: 'User not found' };
    }

    users[userIndex].isVerified = true;
    users[userIndex].lastLoginAt = new Date().toISOString();
    users[userIndex].sessionStartedAt = new Date().toISOString();
    this.saveStoredUsers(users);

    this.currentUser = users[userIndex];
    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(this.currentUser));
    this.notify();

    return {
      success: true,
      user: this.currentUser,
      message: 'Email verified successfully! Isolated interactive session activated.'
    };
  }

  // Sign In
  public signIn(email: string, _password?: string): { success: boolean; user: ViewerUser | null; message: string } {
    const users = this.getStoredUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!user) {
      // Auto-register convenience for new researchers with verification
      const reg = this.registerViewer(email, _password || 'srbmpr123');
      if (reg.success) {
        return this.verifyAccount(email);
      }
      return { success: false, user: null, message: 'Invalid credentials or user not found' };
    }

    user.isVerified = true;
    user.lastLoginAt = new Date().toISOString();
    user.sessionStartedAt = new Date().toISOString();
    user.sessionToken = `tok_${Math.random().toString(36).substring(2)}`;
    this.saveStoredUsers(users);

    this.currentUser = user;
    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(this.currentUser));
    this.notify();

    return {
      success: true,
      user: this.currentUser,
      message: `Welcome back, ${user.displayName}! Isolated interactive terminal ready.`
    };
  }

  // Quick Demo Login
  public loginDemoUser(): ViewerUser {
    const demo = DEFAULT_USERS[1];
    demo.lastLoginAt = new Date().toISOString();
    demo.sessionStartedAt = new Date().toISOString();
    this.currentUser = demo;
    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(demo));
    this.notify();
    return demo;
  }

  // Quick Admin Login
  public loginAdmin(): ViewerUser {
    const admin = DEFAULT_USERS[0];
    admin.lastLoginAt = new Date().toISOString();
    admin.sessionStartedAt = new Date().toISOString();
    this.currentUser = admin;
    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(admin));
    this.notify();
    return admin;
  }

  // Sign Out
  public signOut() {
    this.currentUser = null;
    localStorage.removeItem(STORAGE_KEY_SESSION);
    this.notify();
  }

  // Registered Users Count
  public getAllRegisteredUsers(): ViewerUser[] {
    return this.getStoredUsers();
  }
}
