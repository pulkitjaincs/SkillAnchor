"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import api, { authAPI } from '@/lib/api';

interface User {
    _id: string;
    name: string;
    email?: string;
    role: 'worker' | 'employer';
    avatar?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (user: User) => void;
    logout: () => void;
    updateUserData: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const queryClient = useQueryClient();

    useEffect(() => {
        const restoreSession = async () => {
            try {
                const res = await authAPI.getMe();
                setUser(res.data.user);
            } catch (err) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        restoreSession();

        const handleUnauthorized = () => logout();
        window.addEventListener('auth:unauthorized', handleUnauthorized);
        return () => {
            window.removeEventListener('auth:unauthorized', handleUnauthorized);
        };
    }, []);

    const login = (newUser: User) => {
        setUser(newUser);
    };

    const updateUserData = (userData: Partial<User>) => {
        if (!user) return;
        setUser({ ...user, ...userData });
    };

    const logout = async () => {
        try {
            await authAPI.logout();
        } catch (err) {
            console.error("Logout error:", err);
        } finally {
            setUser(null);
            queryClient.clear();
        }
    };
    return (
        <AuthContext.Provider value={{ user, loading, login, logout, updateUserData }}>
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
