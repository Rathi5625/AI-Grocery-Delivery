import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as loginApi, register as registerApi } from '../api/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser]       = useState(null);
    const [loading, setLoading] = useState(true);

    // Boot: hydrate from localStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem('user');
            if (saved) setUser(JSON.parse(saved));
        } catch { /* corrupt data — clear it */ localStorage.removeItem('user'); }
        setLoading(false);
    }, []);

    /** Persist auth state to localStorage */
    const persist = useCallback((accessToken, refreshToken, userInfo) => {
        localStorage.setItem('token', accessToken);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(userInfo));
        setUser(userInfo);
    }, []);

    /**
     * Login: backend returns ApiResponse<AuthResponse>
     * After axios unwrap: { accessToken, refreshToken, expiresIn, user }
     */
    const login = async (email, password) => {
        const res = await loginApi({ email, password });
        // res.data is already unwrapped by axios interceptor
        const { accessToken, refreshToken, user: userInfo } = res.data;
        persist(accessToken, refreshToken, userInfo);
        return userInfo;
    };

    /**
     * Register: same structure as login response
     */
    const signup = async (data) => {
        const res = await registerApi(data);
        const { accessToken, refreshToken, user: userInfo } = res.data;
        persist(accessToken, refreshToken, userInfo);
        return userInfo;
    };

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setUser(null);
    }, []);

    /** Quick helper for role checks */
    const isAdmin = user?.role === 'ADMIN';

    return (
        <AuthContext.Provider value={{
            user, login, signup, logout, loading,
            isAuthenticated: !!user,
            isAdmin,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
