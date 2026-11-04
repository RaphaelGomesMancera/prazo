import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { loginUser, logoutUser, registerUser, resetPassword } from '../services/authService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  // O Firebase não dispara onAuthStateChanged quando só o perfil muda (updateProfile).
  // Este contador força os consumidores do contexto a re-renderizarem e lerem o displayName novo.
  const [profileVersion, setProfileVersion] = useState(0);

  // Observa o estado de autenticação. Na abertura do app, o Firebase restaura
  // a sessão salva (AsyncStorage) e dispara este callback.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setInitializing(false);
    });
    return unsubscribe;
  }, []);

  const signUp = useCallback(async (name, email, password) => {
    const newUser = await registerUser(name, email, password);
    setProfileVersion((v) => v + 1);
    return newUser;
  }, []);

  const value = useMemo(
    () => ({
      user,
      initializing,
      signIn: loginUser,
      signUp,
      signOut: logoutUser,
      resetPassword,
    }),
    [user, initializing, signUp, profileVersion]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
