
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
    getAuth, 
    onAuthStateChanged, 
    User as FirebaseUser,
    signOut,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { firebaseApp, db } from '@/lib/firebase';
import type { User } from '@/lib/types';
import type { LoginInput, RegisterInput } from '@/lib/schemas';


interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginInput) => Promise<User['role'] | null>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth(firebaseApp);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // User is signed in, get their profile from Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUser({ uid: firebaseUser.uid, ...userDoc.data() } as User);
        } else {
          // This case might happen if a user is in Auth but not Firestore.
          // For now, we'll treat them as logged out.
          setUser(null);
        }
      } else {
        // User is signed out
        setUser(null);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [auth]);

  const login = async (data: LoginInput): Promise<User['role'] | null> => {
    const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
    const firebaseUser = userCredential.user;
    
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        // onAuthStateChanged will handle setting the global user state
        return userData.role;
    }
    
    // This case should ideally not be reached if registration is enforced
    await signOut(auth);
    throw new Error("User profile not found. Please contact support.");
  };
  
  const register = async (data: RegisterInput) => {
    const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
    const firebaseUser = userCredential.user;
    
    // Create user profile in Firestore
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const newUser: Omit<User, 'uid'> = {
        email: data.email,
        fullName: data.fullName,
        universityId: data.universityId,
        role: data.role,
        createdAt: new Date().toISOString(),
    };
    await setDoc(userDocRef, newUser);

    setUser({ uid: firebaseUser.uid, ...newUser });
  };

  const logout = async () => {
    await signOut(auth);
    // onAuthStateChanged will handle setting the user state to null
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
