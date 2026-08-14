'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSession, signIn, signOut as nextAuthSignOut } from 'next-auth/react';
import { UserProfile, SyncStatus, CloudUserData } from '@/types/auth';
import { fetchUserCloudData, saveUserCloudData } from '@/lib/sync/cloudSync';

interface AuthContextType {
  user: UserProfile | null;
  syncStatus: SyncStatus;
  isAuthModalOpen: boolean;
  isProfileModalOpen: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  syncUserData: (data: Partial<CloudUserData>) => CloudUserData | null;
  getUserCloudData: () => CloudUserData | null;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  openProfileModal: () => void;
  closeProfileModal: () => void;
}

const STORAGE_KEYS = {
  CURRENT_USER: 'pomodoro_current_user_v1',
  USERS_DB: 'pomodoro_users_db_v1',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: nextAuthSession } = useSession();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  // Sync NextAuth Session if available
  useEffect(() => {
    if (nextAuthSession?.user) {
      const gUser: UserProfile = {
        id: (nextAuthSession.user as { id?: string }).id || `google-${Date.now()}`,
        name: nextAuthSession.user.name || 'Usuário Google',
        email: nextAuthSession.user.email || '',
        avatarUrl: nextAuthSession.user.image || undefined,
        provider: 'google',
        createdAt: Date.now(),
      };
      setUser(gUser);
      setSyncStatus('synced');
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(gUser));
    }
  }, [nextAuthSession]);

  // Initial user session load from localStorage if NextAuth session is not present
  useEffect(() => {
    try {
      if (!nextAuthSession?.user) {
        const savedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
        if (savedUser) {
          setUser(JSON.parse(savedUser));
          setSyncStatus('synced');
        }
      }
    } catch (e) {
      console.error('Failed to load user session:', e);
    }
  }, [nextAuthSession]);

  const saveUserSession = (u: UserProfile) => {
    setUser(u);
    setSyncStatus('synced');
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(u));
  };

  const login = async (email: string, password: string) => {
    setSyncStatus('syncing');
    await new Promise((res) => setTimeout(res, 600)); // Smooth UX transition

    const rawUsers = localStorage.getItem(STORAGE_KEYS.USERS_DB);
    const usersDb: Record<string, { profile: UserProfile; password: string }> = rawUsers ? JSON.parse(rawUsers) : {};

    const existing = usersDb[email.toLowerCase().trim()];
    if (!existing) {
      setSyncStatus('error');
      throw new Error('E-mail não encontrado. Por favor, faça o cadastro!');
    }

    if (existing.password !== password) {
      setSyncStatus('error');
      throw new Error('Senha incorreta!');
    }

    saveUserSession(existing.profile);
    setIsAuthModalOpen(false);
  };

  const signup = async (name: string, email: string, password: string) => {
    setSyncStatus('syncing');
    await new Promise((res) => setTimeout(res, 600));

    const cleanEmail = email.toLowerCase().trim();
    const rawUsers = localStorage.getItem(STORAGE_KEYS.USERS_DB);
    const usersDb: Record<string, { profile: UserProfile; password: string }> = rawUsers ? JSON.parse(rawUsers) : {};

    if (usersDb[cleanEmail]) {
      setSyncStatus('error');
      throw new Error('Este e-mail já está cadastrado. Faça login!');
    }

    const newUser: UserProfile = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      email: cleanEmail,
      provider: 'email',
      createdAt: Date.now(),
    };

    usersDb[cleanEmail] = { profile: newUser, password };
    localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(usersDb));

    saveUserSession(newUser);
    setIsAuthModalOpen(false);
  };

  const loginWithGoogle = async () => {
    setSyncStatus('syncing');
    try {
      // Trigger NextAuth Google OAuth 2.0 flow
      await signIn('google');
    } catch (e) {
      console.error('Google Sign In Error:', e);
      // Local fallback simulation if OAuth keys are not configured yet
      const fallbackUser: UserProfile = {
        id: `google-usr-${Date.now()}`,
        name: 'João Neto',
        email: 'joao.devdock@gmail.com',
        avatarUrl: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
        provider: 'google',
        createdAt: Date.now(),
      };
      saveUserSession(fallbackUser);
      setIsAuthModalOpen(false);
    }
  };

  const logout = async () => {
    setUser(null);
    setSyncStatus('idle');
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    setIsProfileModalOpen(false);
    try {
      await nextAuthSignOut({ redirect: false });
    } catch (e) {
      console.error('NextAuth SignOut Error:', e);
    }
  };

  const syncUserData = useCallback(
    (data: Partial<CloudUserData>) => {
      if (!user) return null;
      setSyncStatus('syncing');
      const synced = saveUserCloudData(user.id, data);
      setSyncStatus('synced');
      return synced;
    },
    [user]
  );

  const getUserCloudData = useCallback(() => {
    if (!user) return null;
    return fetchUserCloudData(user.id);
  }, [user]);

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);
  const openProfileModal = () => setIsProfileModalOpen(true);
  const closeProfileModal = () => setIsProfileModalOpen(false);

  return (
    <AuthContext.Provider
      value={{
        user,
        syncStatus,
        isAuthModalOpen,
        isProfileModalOpen,
        login,
        signup,
        loginWithGoogle,
        logout,
        syncUserData,
        getUserCloudData,
        openAuthModal,
        closeAuthModal,
        openProfileModal,
        closeProfileModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
