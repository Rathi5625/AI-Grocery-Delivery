import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { createOrder } from '../api/orderApi';
import { getProfile } from '../api/profileApi';
import toast from 'react-hot-toast';

import AddressSelector from '../components/checkout/AddressSelector';
import PaymentSelector from '../components/checkout/PaymentSelector';
import OrderSummary from '../components/checkout/OrderSummary';
import StickyCheckoutBar from '../components/checkout/StickyCheckoutBar';

export default function CheckoutPage() {
  const { cart, fetchCart, loading: cartLoading } = useCart();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [useCustomAddress, setUseCustomAddress] = useState(false);
  const [customAddress, setCustomAddress] = useState({ name: '', phone: '', address: '', city: '', pincode: '' });
  
  const [selectedPaymentId, setSelectedPaymentId] = useState('COD');

  const paymentMethods = [
    {
      id: 'COD',
      label: 'Cash on Delivery'
    },
    {
      id: 'UPI',
      label: 'UPI / Card (Online)'
    }
  ];

  // Fetch addresses on mount
  useEffect(() => {
    const loadAddresses = async () => {
      try {
        const res = await getProfile();
        if (res.data?.addresses && res.data.addresses.length > 0) {
          setAddresses(res.data.addresses);
          setSelectedAddressId(res.data.addresses[0].id);
        } else {
          setUseCustomAddress(true);
        }
      } catch (err) {
        setUseCustomAddress(true); // fallback to manual if error
      }
    };
    loadAddresses();
  }, []);

  // Redirect if cart is completely empty and finished loading
  const items = cart?.items || [];
  useEffect(() => {
    if (!cartLoading && items.length === 0) {
      toast('Your cart is empty');
      navigate('/cart');
    }
  }, [items.length, cartLoading, navigate]);

  // Map backend cart to UI items
  const uiItems = items.map(item => ({
    name: item.productName,
    quantity: item.quantity,
    price: Number(item.totalPrice || 0),
    image: item.productImage || 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=200'
  }));

  const subtotal = Number(cart?.totalAmount) || uiItems.reduce((acc, item) => acc + item.price, 0);
  const curationFee = subtotal > 0 ? 2.00 : 0;
  const deliveryFee = subtotal > 0 && subtotal < 50 ? 5.99 : 0;
  const total = subtotal + curationFee + deliveryFee;

  const handlePlaceOrder = async () => {
    // Validate address
    let addressString = '';
    
    if (useCustomAddress || addresses.length === 0) {
      if (!customAddress.name || !customAddress.phone || !customAddress.address || !customAddress.city || !customAddress.pincode) {
        toast.error('Please fill in all address fields');
        return;
      }
      addressString = `${customAddress.name} (${customAddress.phone}), ${customAddress.address}, ${customAddress.city} - ${customAddress.pincode}`;
    } else {
      const selectedAddr = addresses.find(a => a.id === selectedAddressId);
      if (!selectedAddr) {
        toast.error('Please select an address');
        return;
      }
      addressString = `${selectedAddr.streetAddress || selectedAddr.line1}, ${selectedAddr.city}, ${selectedAddr.state} ${selectedAddr.postalCode || selectedAddr.zip}`;
    }

    setLoading(true);
    try {
      const res = await createOrder({ 
        deliveryAddress: addressString, 
        paymentMethod: selectedPaymentId, 
        notes: '' 
      });
      
      toast.success('Order placed successfully! 🎉');
      
      // Cart should be empty in backend now. Sync context:
      await fetchCart();
      
      navigate('/order-success', { state: { order: res.data } });
    } catch (err) {
      toast.error(err.userMessage || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cartLoading) {
    return <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center text-[#422701]">Loading checkout...</div>;
  }

  return (
    <div className="min-h-screen bg-[#C6C0B9] font-sans">
      <div className="bg-[#FAF7F2] min-h-screen max-w-xl mx-auto relative shadow-2xl">
        {/* Top Bar */}
        <div className="flex items-center px-6 py-5 sticky top-0 bg-[#FAF7F2]/90 backdrop-blur-md z-40 border-b border-[#C6C0B9]/10">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 text-[#422701] hover:bg-[#C6C0B9]/20 rounded-full transition-colors"
          >
            <FiArrowLeft size={20} />
          </button>
          <h1 className="text-[1.1rem] font-medium text-[#422701] ml-2">Checkout</h1>
        </div>

        {/* Content */}
        <div className="px-6 py-6 pb-28">
          <AddressSelector 
            addresses={addresses} 
            selectedId={selectedAddressId} 
            onSelect={setSelectedAddressId}
            customAddress={customAddress}
            onCustomAddressChange={setCustomAddress}
            useCustomAddress={useCustomAddress}
            onSetUseCustomAddress={setUseCustomAddress}
          />
          
          <PaymentSelector 
            methods={paymentMethods} 
            selectedId={selectedPaymentId} 
            onSelect={setSelectedPaymentId} 
          />
          
          <OrderSummary 
            items={uiItems}
            subtotal={subtotal}
            curationFee={curationFee}
            deliveryFee={deliveryFee}
            total={total}
          />
        </div>

        <StickyCheckoutBar 
          total={total} 
          onPlaceOrder={handlePlaceOrder}
          loading={loading}
        />
      </div>
    </div>
  );
}
