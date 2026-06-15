import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, name: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  getInitials: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Monitor Auth state changes
  useEffect(() => {
    // 1. Check if there is an active local admin bypass session
    const localAdmin = localStorage.getItem('aura_admin_bypass');
    if (localAdmin) {
      try {
        setUser(JSON.parse(localAdmin));
        setLoading(false);
        return;
      } catch (e) {
        localStorage.removeItem('aura_admin_bypass');
      }
    }

    // 2. Check URL triggers for secret bypass (?access=admin or /admin-panel)
    const urlParams = new URLSearchParams(window.location.search);
    const hasAccessAdmin = urlParams.get('access') === 'admin';
    const isUrlAdminPanel = window.location.pathname === '/admin-panel';

    if (hasAccessAdmin || isUrlAdminPanel) {
      const mockAdmin = {
        uid: 'secret-admin-bypass',
        email: 'ahmedvyally22@gmail.com',
        displayName: 'المدير أحمد Vyally',
        photoURL: 'https://api.dicebear.com/7.x/initials/svg?seed=AhmedVyally'
      };
      localStorage.setItem('aura_admin_bypass', JSON.stringify(mockAdmin));
      setUser(mockAdmin as any);
      setLoading(false);

      if (hasAccessAdmin) {
        // Clean up the URL query parameters so the URL stays neat
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!localStorage.getItem('aura_admin_bypass')) {
        setUser(currentUser);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUpWithEmail = async (email: string, name: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (userCredential.user) {
      // Update display name instantly in profile details
      await updateProfile(userCredential.user, {
        displayName: name,
        photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`
      });
      // Force User update by fetching refreshed user profile fields
      setUser({ ...userCredential.user, displayName: name });
    }
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    localStorage.removeItem('aura_admin_bypass');
    await signOut(auth);
    setUser(null);
  };

  const getInitials = () => {
    if (!user) return 'A';
    if (user.displayName) {
      const parts = user.displayName.trim().split(' ');
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return user.displayName[0].toUpperCase();
    }
    return (user.email ? user.email[0].toUpperCase() : 'A');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithEmail, signUpWithEmail, signInWithGoogle, logout, getInitials }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
