import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';
import { API_ENDPOINTS, STORAGE_KEYS } from '../utils/constants';

export interface UserPreferences {
  notifications: {
    email: boolean;
    inApp: boolean;
    push: boolean;
  };
  reminderTimings: string[];
  defaultStartScreen: string;
  weekStartDay: 'monday' | 'sunday';
}

export interface User {
  id: string;
  email: string;
  name?: string;
  currency?: string;
  locale?: string;
  timezone?: string;
  preferences?: UserPreferences;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isNewUser: boolean;
  register: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  updateProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
    const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

    if (storedUser && accessToken) {
      try {
        setUser(JSON.parse(storedUser));
        // Verify token is still valid by fetching user info
        fetchUser();
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.PROFILE);
      const userData = response.data.data;
      setUser(userData);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
    } catch (error) {
      console.error('Error fetching user:', error);
      // Token might be invalid, clear storage
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (): Promise<void> => {
    try {
      const response = await api.get(API_ENDPOINTS.PROFILE);
      const userData = response.data.data;
      setUser(userData);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string): Promise<void> => {
    try {
      const response = await api.post(API_ENDPOINTS.REGISTER, { email, password });
      const { user: userData, accessToken, refreshToken } = response.data.data;

      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));

      setUser(userData);

      // Fetch full profile to check if user is new
      try {
        const profileResponse = await api.get(API_ENDPOINTS.PROFILE);
        const fullUserData = profileResponse.data.data;
        setUser(fullUserData);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(fullUserData));
      } catch (profileError) {
        // If profile fetch fails, continue with basic user data
        console.error('Error fetching profile:', profileError);
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || error.response?.data?.errors?.[0]?.msg || 'Registration failed';
      throw new Error(errorMessage);
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await api.post(API_ENDPOINTS.LOGIN, { email, password });
      const { user: userData, accessToken, refreshToken } = response.data.data;

      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));

      setUser(userData);

      // Fetch full profile to check if user is new
      try {
        const profileResponse = await api.get(API_ENDPOINTS.PROFILE);
        const fullUserData = profileResponse.data.data;
        setUser(fullUserData);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(fullUserData));
      } catch (profileError) {
        // If profile fetch fails, continue with basic user data
        console.error('Error fetching profile:', profileError);
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || error.response?.data?.errors?.[0]?.msg || 'Login failed';
      throw new Error(errorMessage);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      if (refreshToken) {
        await api.post(API_ENDPOINTS.LOGOUT, { refreshToken });
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      setUser(null);
    }
  };

  const logoutAll = async (): Promise<void> => {
    try {
      await api.post(API_ENDPOINTS.LOGOUT_ALL);
    } catch (error) {
      console.error('Error during logout all:', error);
    } finally {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      setUser(null);
    }
  };

  // Check if user is new (no name set)
  const isNewUser = user ? !user.name || user.name.trim() === '' : false;

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    isNewUser,
    register,
    login,
    logout,
    logoutAll,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

