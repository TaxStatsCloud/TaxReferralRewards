import { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { 
  registerWithEmailAndPassword, 
  loginWithEmailAndPassword, 
  signOut,
  subscribeToAuthChanges,
  getUserProfile
} from "@/lib/firebase";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: number;
  uid: string;
  username: string;
  email: string;
  displayName?: string;
  role: string;
  isAdmin: boolean;
  referralCode: string;
}

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  register: (email: string, password: string, userData: any) => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<boolean>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  error: null,
  register: async () => false,
  login: async () => false,
  logout: async () => false,
  isAuthenticated: false,
  isAdmin: false
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session
  useEffect(() => {
    setLoading(true);
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/session', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const userData = await response.json();
          setCurrentUser(userData);
        }
      } catch (err) {
        console.error("Session check error:", err);
        setError("Failed to check authentication status");
      } finally {
        setLoading(false);
      }
    };
    
    checkSession();
  }, []);

  // Register a new user
  const register = async (email: string, password: string, userData: any): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest("POST", "/api/auth/register", {
        username: userData.username,
        email,
        password,
        displayName: userData.displayName,
        role: userData.role || "candidate",
        isAdmin: false,
        referralCode: userData.referralCode || ""
      });
      
      const user = await response.json();
      setCurrentUser(user);
      return true;
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || "Registration failed");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Login existing user
  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest("POST", "/api/auth/login", {
        username: email,
        password
      });
      
      const user = await response.json();
      setCurrentUser(user);
      return true;
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Login failed");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = async (): Promise<boolean> => {
    setLoading(true);
    
    try {
      await apiRequest("POST", "/api/auth/logout", {});
      setCurrentUser(null);
      return true;
    } catch (err: any) {
      console.error("Logout error:", err);
      setError(err.message || "Logout failed");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    loading,
    error,
    register,
    login,
    logout,
    isAuthenticated: !!currentUser,
    isAdmin: currentUser?.isAdmin || false
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
