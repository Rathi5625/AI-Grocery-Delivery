import { createContext, useContext, useState, useEffect } from 'react';
import { login as loginApi, register as registerApi } from '../api/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const saved = localStorage.getItem('user');
        if (saved) setUser(JSON.parse(saved));
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const res = await loginApi({ email, password });
        const { accessToken, user: userInfo } = res.data;
        localStorage.setItem('token', accessToken);
        localStorage.setItem('user', JSON.stringify(userInfo));
        setUser(userInfo);
        return userInfo;
    };

    const signup = async (data) => {
        const res = await registerApi(data);
        const { accessToken, user: userInfo } = res.data;
        localStorage.setItem('token', accessToken);
        localStorage.setItem('user', JSON.stringify(userInfo));
        setUser(userInfo);
        return userInfo;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, loading, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
