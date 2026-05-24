import { createContext, useContext, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as cartApi from '../api/cartApi';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const { isAuthenticated } = useAuth();
    const queryClient = useQueryClient();

    // Query for fetching cart
    const { data: cartData, isFetching: loading } = useQuery({
        queryKey: ['cart'],
        queryFn: async () => {
            const res = await cartApi.getCart();
            return res.data ?? { items: [], totalAmount: 0, itemCount: 0 };
        },
        enabled: isAuthenticated,
        staleTime: 0,
    });

    const cart = cartData ?? { items: [], totalAmount: 0, itemCount: 0 };

    // Wrapper for compatibility with pages that call fetchCart
    const fetchCart = useCallback(async () => {
        if (isAuthenticated) {
            await queryClient.refetchQueries({ queryKey: ['cart'] });
        }
    }, [isAuthenticated, queryClient]);

    // Mutations for cart operations
    const addItemMutation = useMutation({
        mutationFn: async ({ productId, quantity }) => {
            const res = await cartApi.addToCart(productId, quantity);
            return res.data;
        },
        onSuccess: (data) => {
            queryClient.setQueryData(['cart'], data);
        }
    });

    const updateItemMutation = useMutation({
        mutationFn: async ({ itemId, quantity }) => {
            const res = await cartApi.updateCartItem(itemId, quantity);
            return res.data;
        },
        onSuccess: (data) => {
            queryClient.setQueryData(['cart'], data);
        }
    });

    const removeItemMutation = useMutation({
        mutationFn: async (itemId) => {
            await cartApi.removeCartItem(itemId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
        }
    });

    const clearCartMutation = useMutation({
        mutationFn: async () => {
            await cartApi.clearCart();
        },
        onSuccess: () => {
            queryClient.setQueryData(['cart'], { items: [], totalAmount: 0, itemCount: 0 });
        }
    });

    const addItem = async (productId, quantity = 1) => {
        return addItemMutation.mutateAsync({ productId, quantity });
    };

    const updateItem = async (itemId, quantity) => {
        return updateItemMutation.mutateAsync({ itemId, quantity });
    };

    const removeItem = async (itemId) => {
        return removeItemMutation.mutateAsync(itemId);
    };

    const clear = async () => {
        return clearCartMutation.mutateAsync();
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

