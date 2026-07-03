import React, { createContext, ReactNode, useContext, useState } from 'react';

interface AuthContextValue {
  user?: Record<string, unknown> | null;
  signIn?: (email: string, password: string) => Promise<void>;
  signOut?: () => void;
}

const AuthContext = createContext<AuthContextValue>({});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Record<string, unknown> | null>(null);

  const signIn = async (email: string, password: string) => {
    setUser({ email });
  };

  const signOut = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
