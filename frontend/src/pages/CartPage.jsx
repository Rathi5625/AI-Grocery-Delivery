import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import CartItem from '../components/cart/CartItem';
import OrderSummary from '../components/cart/OrderSummary';

export default function CartPage() {
  const { cart, loading, fetchCart, updateItem, removeItem } = useCart();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleQty = async (itemId, newQty) => {
    if (newQty < 1) return;
    try {
      await updateItem(itemId, newQty);
    } catch (err) {
      console.error('Failed to update quantity', err);
    }
  };

  const handleRemove = async (itemId) => {
    try {
      await removeItem(itemId);
    } catch (err) {
      console.error('Failed to remove item', err);
    }
  };

  const items = cart?.items || [];

  // Use cart-provided totals where available, compute as fallback
  const subtotal = Number(cart?.totalAmount) || items.reduce((acc, item) => acc + Number(item.totalPrice || 0), 0);
  const totalQty = items.reduce((acc, item) => acc + (item.quantity || 0), 0);
  const deliveryFee = subtotal > 0 && subtotal < 50 ? 5.99 : 0;
  const serviceFee  = subtotal > 0 ? 2.50 : 0;
  const total       = subtotal + deliveryFee + serviceFee;

  return (
    <div className="min-h-screen bg-[#FAF8F5] font-sans">
      <main className="max-w-7xl mx-auto px-6 md:px-8 py-12 md:py-16">
        <h1 className="text-4xl md:text-5xl font-medium text-[#422701] mb-12">Your Cart</h1>

        {loading ? (
          /* ── Skeleton ── */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            <div className="lg:col-span-7 xl:col-span-8 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse flex p-4 bg-[#F2ECE4] rounded-2xl gap-4">
                  <div className="w-20 h-20 bg-[#C6C0B9]/30 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2 py-2">
                    <div className="h-4 bg-[#C6C0B9]/30 rounded w-1/3" />
                    <div className="h-3 bg-[#C6C0B9]/30 rounded w-1/4" />
                  </div>
                  <div className="h-8 w-28 bg-[#C6C0B9]/30 rounded-full self-center" />
                  <div className="h-6 w-16 bg-[#C6C0B9]/30 rounded self-center" />
                </div>
              ))}
            </div>
            <div className="lg:col-span-5 xl:col-span-4 h-[340px] bg-[#F2ECE4] rounded-2xl animate-pulse" />
          </div>

        ) : items.length === 0 ? (
          /* ── Empty state ── */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-24 text-center max-w-md mx-auto"
          >
            <div className="text-6xl mb-6">🛒</div>
            <h2 className="text-2xl text-[#422701] font-medium mb-4">Your cart is empty</h2>
            <p className="text-[#705E46] mb-8">Add some fresh, organic products to get started</p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#D6B588] text-[#422701] rounded-xl font-semibold hover:bg-[#c9a778] transition-colors shadow-sm"
            >
              Go to Shop
            </Link>
          </motion.div>

        ) : (
          /* ── Cart content ── */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

            {/* Items list */}
            <div className="lg:col-span-7 xl:col-span-8">
              <AnimatePresence mode="popLayout">
                {items.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onUpdateQuantity={handleQty}
                    onRemove={handleRemove}
                  />
                ))}
              </AnimatePresence>
            </div>

            {/* Order summary */}
            <div className="lg:col-span-5 xl:col-span-4 w-full">
              <OrderSummary
                itemCount={totalQty}
                subtotal={subtotal}
                deliveryFee={deliveryFee}
                serviceFee={serviceFee}
                total={total}
              />
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
