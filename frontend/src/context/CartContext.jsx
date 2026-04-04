import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import * as cartApi from '../api/cartApi';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const [cart, setCart]       = useState({ items: [], totalAmount: 0, itemCount: 0 });
    const [loading, setLoading] = useState(false);
    const { isAuthenticated }   = useAuth();

    /**
     * res.data is already the unwrapped CartDTO from ApiResponse
     * CartDTO: { id, totalAmount, items: CartItemDTO[], itemCount }
     */
    const fetchCart = useCallback(async () => {
        if (!isAuthenticated) return;
        setLoading(true);
        try {
            const res = await cartApi.getCart();
            setCart(res.data ?? { items: [], totalAmount: 0, itemCount: 0 });
        } catch (err) {
            console.error('Failed to fetch cart:', err);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    // Auto-fetch on login
    useEffect(() => {
        if (isAuthenticated) fetchCart();
        else setCart({ items: [], totalAmount: 0, itemCount: 0 });
    }, [isAuthenticated, fetchCart]);

    const addItem = async (productId, quantity = 1) => {
        const res = await cartApi.addToCart(productId, quantity);
        setCart(res.data);
        return res.data;
    };

    const updateItem = async (itemId, quantity) => {
        const res = await cartApi.updateCartItem(itemId, quantity);
        setCart(res.data);
        return res.data;
    };

    const removeItem = async (itemId) => {
        await cartApi.removeCartItem(itemId);
        // Refresh to get accurate totals from server
        await fetchCart();
    };

    const clear = async () => {
        await cartApi.clearCart();
        setCart({ items: [], totalAmount: 0, itemCount: 0 });
    };

    /** Computed helpers */
    const itemCount = cart?.items?.length ?? 0;
    const totalAmount = cart?.totalAmount ?? 0;

    return (
        <CartContext.Provider value={{
            cart,
            loading,
            itemCount,
            totalAmount,
            fetchCart,
            addItem,
            updateItem,
            removeItem,
            clearCart: clear,
        }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => useContext(CartContext);
