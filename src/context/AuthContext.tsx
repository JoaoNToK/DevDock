'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSession, signIn, signOut as nextAuthSignOut } from 'next-auth/react';
import { UserProfile, SyncStatus, CloudUserData } from '@/types/auth';
import { registerUserAction, loginUserAction } from '@/app/actions/authActions';
import { fetchUserCloudData, saveUserCloudData } from '@/lib/sync/cloudSync';
import { STORAGE_KEYS, storageAdapter } from '@/lib/storage';

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
      const userIdentifier = nextAuthSession.user.email || (nextAuthSession.user as { id?: string }).id;
      storageAdapter.setUserNamespace(userIdentifier);
      const gUser: UserProfile = {
        id: (nextAuthSession.user as { id?: string }).id || `usr-session-${Date.now()}`,
        name: nextAuthSession.user.name || 'Usuário DevDock',
        email: nextAuthSession.user.email || '',
        avatarUrl: nextAuthSession.user.image || undefined,
        provider: ((nextAuthSession.user as { provider?: string }).provider as UserProfile['provider']) || 'google',
        createdAt: Date.now(),
      };
      setUser(gUser);
      setSyncStatus('synced');
      storageAdapter.set(STORAGE_KEYS.CURRENT_USER, gUser);
    } else {
      const savedUser = storageAdapter.get<UserProfile | null>(STORAGE_KEYS.CURRENT_USER, null);
      if (savedUser) {
        storageAdapter.setUserNamespace(savedUser.email || savedUser.id);
        setUser(savedUser);
        setSyncStatus('synced');
      } else {
        storageAdapter.setUserNamespace(null);
      }
    }
  }, [nextAuthSession]);

  const saveUserSession = (u: UserProfile) => {
    setUser(u);
    setSyncStatus('synced');
    storageAdapter.set(STORAGE_KEYS.CURRENT_USER, u);
  };

  const login = async (email: string, password: string) => {
    setSyncStatus('syncing');
    try {
      // 1. Try NextAuth Credentials SignIn
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        // Fallback to Server Action bcrypt validation
        const res = await loginUserAction({ email, password });
        if (res.success && res.user) {
          const profile: UserProfile = {
            id: res.user.id,
            name: res.user.name,
            email: res.user.email,
            avatarUrl: res.user.image || undefined,
            provider: 'email',
            createdAt: new Date(res.user.createdAt).getTime(),
          };
          saveUserSession(profile);
          setIsAuthModalOpen(false);
          return;
        }
        setSyncStatus('error');
        throw new Error(res.error || result?.error || 'E-mail ou senha incorretos.');
      }

      setIsAuthModalOpen(false);
    } catch (err: unknown) {
      setSyncStatus('error');
      const msg = err instanceof Error ? err.message : 'E-mail ou senha incorretos.';
      throw new Error(msg);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    setSyncStatus('syncing');
    try {
      const res = await registerUserAction({ name, email, password });
      if (res.success && res.user) {
        const profile: UserProfile = {
          id: res.user.id,
          name: res.user.name,
          email: res.user.email,
          avatarUrl: res.user.image || undefined,
          provider: 'email',
          createdAt: new Date(res.user.createdAt).getTime(),
        };
        saveUserSession(profile);

        // Sign in via NextAuth after signup
        await signIn('credentials', {
          email,
          password,
          redirect: false,
        });

        setIsAuthModalOpen(false);
      } else {
        setSyncStatus('error');
        throw new Error(res.error || 'Erro ao realizar cadastro.');
      }
    } catch (err: unknown) {
      setSyncStatus('error');
      const msg = err instanceof Error ? err.message : 'Erro ao realizar cadastro.';
      throw new Error(msg);
    }
  };

  const loginWithGoogle = async () => {
    setSyncStatus('syncing');
    try {
      const res = await signIn('google', { redirect: false });
      if (res?.error) {
        setSyncStatus('error');
        throw new Error('Falha ao autenticar com o Google. Tente novamente.');
      }
    } catch (e: unknown) {
      setSyncStatus('error');
      const msg = e instanceof Error ? e.message : 'Falha na autenticação com o Google.';
      throw new Error(msg);
    }
  };

  const logout = async () => {
    setUser(null);
    setSyncStatus('idle');
    storageAdapter.remove(STORAGE_KEYS.CURRENT_USER);
    storageAdapter.setUserNamespace(null);
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
