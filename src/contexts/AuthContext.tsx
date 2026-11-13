import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut,
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../lib/firebase';
import { checkUserIsAdmin } from '../lib/firestore-service';

interface AuthContextValue {
  user: User | null;
  isAdmin: boolean;
  authReady: boolean;
  loading: boolean;
  firebaseConfigured: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  logout: () => Promise<void>;
  refreshAdminStatus: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [authReady, setAuthReady] = useState<boolean>(!isFirebaseConfigured);
  const [loading, setLoading] = useState<boolean>(false);

  const verifyAdminRole = useCallback(async (firebaseUser: User | null): Promise<boolean> => {
    if (!firebaseUser) {
      setIsAdmin(false);
      return false;
    }
    const adminResult = await checkUserIsAdmin(firebaseUser);
    setIsAdmin(adminResult);
    return adminResult;
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setAuthReady(true);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      await verifyAdminRole(currentUser);
      setAuthReady(true);
    });

    return () => unsubscribe();
  }, [verifyAdminRole]);

  const signInWithEmail = async (email: string, password: string) => {
    if (!auth) throw new Error('Firebase Authentication is not configured.');
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      await verifyAdminRole(cred.user);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    if (!auth || !googleProvider) {
      throw new Error('Firebase Authentication is not configured.');
    }
    setLoading(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      await verifyAdminRole(cred.user);
    } finally {
      setLoading(false);
    }
  };

  const sendPasswordReset = async (email: string) => {
    if (!auth) throw new Error('Firebase Authentication is not configured.');
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async () => {
    if (!auth?.currentUser) throw new Error('No authenticated user found.');
    setLoading(true);
    try {
      await sendEmailVerification(auth.currentUser);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (!auth) return;
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const refreshAdminStatus = async () => {
    if (auth?.currentUser) {
      await auth.currentUser.reload();
      setUser(auth.currentUser);
      return verifyAdminRole(auth.currentUser);
    }
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        authReady,
        loading,
        firebaseConfigured: isFirebaseConfigured,
        signInWithEmail,
        signInWithGoogle,
        sendPasswordReset,
        resendVerification,
        logout,
        refreshAdminStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
