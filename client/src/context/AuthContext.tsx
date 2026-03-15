"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

interface User {
    id: string;
    name: string;
    email?: string;
    role: 'worker' | 'employer';
    avatar?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
    updateUserData: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const queryClient = useQueryClient();

    useEffect(() => {
        const storedToken = localStorage.getItem('skillanchor_token');
        const storedUser = localStorage.getItem('skillanchor_user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
        const handleUnauthorized = () => logout();
        window.addEventListener('auth:unauthorized', handleUnauthorized);
        return () => {
            window.removeEventListener('auth:unauthorized', handleUnauthorized);
        };
    }, []);
    const login = (newToken: string, newUser: User) => {
        localStorage.setItem('skillanchor_token', newToken);
        localStorage.setItem('skillanchor_user', JSON.stringify(newUser));
        document.cookie = `skillanchor_token=${newToken}; path=/; max-age=604800; samesite=lax`;
        setToken(newToken);
        setUser(newUser);
    };
    const updateUserData = (userData: Partial<User>) => {
        if (!user) {
            return;
        }
        const newUser = { ...user, ...userData };
        localStorage.setItem('skillanchor_user', JSON.stringify(newUser));
        setUser(newUser);
    };
    const logout = () => {
        localStorage.removeItem('skillanchor_token');
        localStorage.removeItem('skillanchor_user');
        document.cookie = `skillanchor_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        setToken(null);
        setUser(null);
        queryClient.clear();
    };
    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout, updateUserData }}>
            {children}
        </AuthContext.Provider>
    );
}
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
