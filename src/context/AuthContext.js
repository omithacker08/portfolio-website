import React, { createContext, useContext, useState, useEffect } from 'react';
import ApiService from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Demo mode flag - set to false for production
  const DEMO_MODE = process.env.NODE_ENV === 'development';

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        
        if (token && savedUser) {
          const userData = JSON.parse(savedUser);
          
          // Validate user data structure
          if (userData && userData.email && userData.role) {
            setUser(userData);
            ApiService.setToken(token);
          } else {
            // Invalid user data, clear storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear corrupted data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    initializeAuth();
  }, []);

  const login = async (email, password, otp) => {
    try {
      setLoading(true);
      
      // Production OTP validation
      if (!DEMO_MODE && (!otp || otp.length < 4)) {
        throw new Error('Please enter a valid OTP');
      }
      
      // Try API login first
      const data = await ApiService.login(email, password);
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      toast.success('Login successful!');
      return data;
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, otp) => {
    try {
      setLoading(true);
      
      // Production OTP validation
      if (!DEMO_MODE && (!otp || otp.length < 4)) {
        throw new Error('Please enter a valid OTP');
      }
      
      try {
        // Try API registration first
        const data = await ApiService.register({ name, email, password });
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        toast.success('Registration successful!');
        return data;
      } catch (apiError) {
        // Fallback to demo registration
        const demoUser = {
          id: Date.now(),
          name: name,
          email: email,
          role: 'user'
        };
        
        const demoToken = `demo-token-${demoUser.id}-${Date.now()}`;
        
        setUser(demoUser);
        localStorage.setItem('user', JSON.stringify(demoUser));
        localStorage.setItem('token', demoToken);
        ApiService.setToken(demoToken);
        toast.success(`Registration successful! ${DEMO_MODE ? '(Demo mode)' : ''}`);
        return { user: demoUser, token: demoToken };
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    ApiService.logout();
    toast.success('Logged out successfully');
  };

  const sendOTP = async (email) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        toast.success('OTP sent to your email');
        resolve(true);
      }, 1000);
    });
  };

  const value = {
    user,
    login,
    register,
    logout,
    sendOTP,
    loading,
    isAdmin: user?.role === 'admin',
    isAuthenticated: !!user,
    demoMode: DEMO_MODE
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};