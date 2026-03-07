import { createContext, useContext, useState, useCallback } from 'react';
import * as cartApi from '../api/cartApi';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const [cart, setCart] = useState({ items: [], totalAmount: 0, itemCount: 0 });
    const [loading, setLoading] = useState(false);
    const { isAuthenticated } = useAuth();

    const fetchCart = useCallback(async () => {
        if (!isAuthenticated) return;
        setLoading(true);
        try {
            const res = await cartApi.getCart();
            setCart(res.data);
        } catch (err) {
            console.error('Failed to fetch cart:', err);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    const addItem = async (productId, quantity = 1) => {
        const res = await cartApi.addToCart(productId, quantity);
        setCart(res.data);
    };

    const updateItem = async (itemId, quantity) => {
        const res = await cartApi.updateCartItem(itemId, quantity);
        setCart(res.data);
    };

    const removeItem = async (itemId) => {
        await cartApi.removeCartItem(itemId);
        await fetchCart();
    };

    const clear = async () => {
        await cartApi.clearCart();
        setCart({ items: [], totalAmount: 0, itemCount: 0 });
    };

    return (
        <CartContext.Provider value={{ cart, loading, fetchCart, addItem, updateItem, removeItem, clearCart: clear }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => useContext(CartContext);
