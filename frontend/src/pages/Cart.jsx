import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ShoppingCart, Trash2, ArrowLeft, Loader2, Minus, Plus, Zap
} from 'lucide-react';

import Navbar, { HEADER_HEIGHT_PADDING } from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { cartService } from '../services/CartService';

const PRIMARY_COLOR = 'indigo'; 

const formatPriceToIDR = (price) => {
    if (typeof price !== 'number' || isNaN(price)) return 'Rp0';
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price);
};

export default function Cart() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth(); 
    
    const [cartData, setCartData] = useState(null); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // ⭐ PERBAIKAN: Mapping data yang benar dari nested structure
    const cartItems = cartData?.items?.map(item => ({
        product_id: item.product_id,
        name: item.product?.name || 'Unknown Product',
        price: item.price_at_addition || 0, // ⭐ GUNAKAN price_at_addition
        quantity: item.quantity,
        image: item.product?.image,
        unit: item.product?.unit || 'Unit'
    })) || [];

    const loadCart = useCallback(async () => {
        setLoading(true);
        setError('');
        
        const token = localStorage.getItem('authToken'); 

        if (!isAuthenticated || !token) {
            setLoading(false);
            if (!isAuthenticated) {
                setError('Please log in to view your cart.');
                setTimeout(() => navigate('/login'), 1500); 
            }
            return;
        }

        try {
            const response = await cartService.getCart(token);
            
            console.log('🛒 Cart Response:', response); // Debug
            
            if (response.success) {
                setCartData(response.cart);
            } else {
                setError(response.message || 'Failed to load cart data from server.');
                setCartData(null);
            }
        } catch (err) {
            console.error('Error loading cart:', err);
            setError('Failed to connect to server or session expired. Please log in again.');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        loadCart();
        window.addEventListener('cartUpdated', loadCart); 
        
        return () => {
             window.removeEventListener('cartUpdated', loadCart);
        };
    }, [loadCart]);

    const updateQuantity = useCallback(async (productId, newQuantity) => {
        const quantity = Math.max(1, newQuantity);
        const token = localStorage.getItem('authToken');
        
        if (!token) {
            alert("Session expired. Please log in.");
            navigate('/login');
            return;
        }

        try {
            const response = await cartService.updateCartItem(productId, quantity, token);
            
            if (response.success) {
                loadCart(); 
                window.dispatchEvent(new Event('cartUpdated')); 
            } else {
                alert(response.message || 'Failed to update quantity. Please check product stock.');
            }
        } catch (error) {
            console.error('Error updating quantity:', error);
            alert('Failed to update quantity. Please check server connection.');
        }
    }, [loadCart, navigate]);

    const removeItem = useCallback(async (productId) => {
        if (!window.confirm("Are you sure you want to remove this item?")) {
            return;
        }

        const token = localStorage.getItem('authToken');

        if (!token) {
            alert("Session expired. Please log in.");
            navigate('/login');
            return;
        }

        try {
            const response = await cartService.removeFromCart(productId, token);
            
            if (response.success) {
                alert('Item removed successfully!');
                loadCart(); 
                window.dispatchEvent(new Event('cartUpdated')); 
            } else {
                alert(response.message || 'Failed to remove item.');
            }
        } catch (error) {
            console.error('Error removing item:', error);
            alert('Failed to remove item. Please check server connection.');
        }
    }, [loadCart, navigate]);

    // Hitung totals
    const totalQuantity = cartItems.reduce((acc, item) => acc + (item.quantity || 0), 0);
    const subtotal = cartData?.total_price || cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const total = subtotal;

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 font-sans">
                <Navbar />
                <div className={HEADER_HEIGHT_PADDING} />
                <main className="w-full">
                    <div className="flex flex-col justify-center items-center h-96 bg-white">
                        <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mb-4" />
                        <p className="text-xl font-bold text-indigo-600">Loading Cart...</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 font-sans">
                <Navbar />
                <div className={HEADER_HEIGHT_PADDING} />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="text-center p-12 bg-red-100 rounded-3xl shadow-xl border border-red-200">
                        <Zap className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h3 className="text-3xl font-extrabold text-red-900 mb-3">Error Loading Cart</h3>
                        <p className="text-red-700 mb-8">{error}</p>
                        <button 
                            onClick={() => navigate('/login')} 
                            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-red-600 hover:bg-red-700 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" /> Go to Login
                        </button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }
    
    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 font-sans">
                <Navbar />
                <div className={HEADER_HEIGHT_PADDING} />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="text-center p-12 bg-white rounded-3xl shadow-xl border border-gray-100">
                        <ShoppingCart className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
                        <h3 className="text-3xl font-extrabold text-gray-900 mb-3">Your Cart is Empty!</h3>
                        <p className="text-gray-600 mb-8">It looks like you haven't added any products yet.</p>
                        <button 
                            onClick={() => navigate('/shop')} 
                            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" /> Start Shopping
                        </button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Navbar />
            <div className={HEADER_HEIGHT_PADDING} aria-hidden="true" />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                
                <h1 className="text-4xl font-extrabold text-gray-900 mb-10 border-b pb-4">
                    Shopping Cart ({totalQuantity} {totalQuantity > 1 ? 'Items' : 'Item'})
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    
                    <div className="lg:col-span-2 space-y-6">
                        {cartItems.map((item, index) => (
                            <div key={item.product_id || index} className="flex items-center p-6 bg-white rounded-2xl shadow-lg border border-gray-100 transition-shadow hover:shadow-xl">
                                
                                <div className="relative">
                                    <img
                                        src={item.image ? 
                                            (item.image.startsWith('http') ? item.image : `http://localhost:8888${item.image}`) 
                                            : `https://via.placeholder.com/100x100?text=No+Image`}
                                        alt={item.name}
                                        className="w-24 h-24 object-cover rounded-xl flex-shrink-0 mr-6 border border-gray-200"
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/100x100?text=No+Image';
                                        }}
                                    />
                                </div>

                                <div className="flex-grow flex justify-between items-center">
                                    <div className="flex-1">
                                        <h2 
                                            className="text-xl font-bold text-gray-900 hover:text-indigo-600 transition-colors cursor-pointer"
                                            onClick={() => navigate(`/product/${item.product_id}`)}
                                        >
                                            {item.name}
                                        </h2>
                                        
                                        <div className="mt-1 space-y-1">
                                            <p className="text-sm font-medium text-gray-500">
                                                {formatPriceToIDR(item.price)} per {item.unit}
                                            </p>
                                        </div>
                                        
                                        <div className="mt-3 flex items-center">
                                            <div className="flex items-center border border-gray-300 rounded-full bg-gray-50 shadow-inner">
                                                <button 
                                                    className="p-2 text-gray-600 hover:bg-gray-200 rounded-full disabled:opacity-30 transition-colors"
                                                    onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                                                    disabled={item.quantity <= 1}
                                                    aria-label="Decrease quantity"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="w-8 text-center font-bold text-gray-900">
                                                    {item.quantity}
                                                </span>
                                                <button 
                                                    className="p-2 text-gray-600 hover:bg-gray-200 rounded-full transition-colors"
                                                    onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                                                    aria-label="Increase quantity"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <span className="ml-3 text-base text-gray-600 font-semibold">
                                                {item.unit}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="text-right ml-6 flex flex-col items-end">
                                        <p className="text-2xl font-extrabold text-rose-600">
                                            {formatPriceToIDR(item.price * item.quantity)}
                                        </p>
                                        <button 
                                            onClick={() => removeItem(item.product_id)}
                                            className="mt-3 text-sm text-red-500 hover:text-red-700 flex items-center font-medium transition-colors p-2 rounded-lg hover:bg-red-50"
                                            aria-label="Remove item"
                                        >
                                            <Trash2 className="w-4 h-4 mr-1" /> Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1 p-8 bg-white rounded-2xl shadow-2xl border border-gray-100 sticky top-28 h-fit">
                        <h2 className="text-2xl font-extrabold text-gray-900 mb-6 border-b pb-3">Order Summary</h2>
                        
                        <div className="space-y-4 text-gray-700">
                            <div className="flex justify-between items-center">
                                <span>Subtotal ({totalQuantity} items)</span>
                                <span className="font-semibold text-lg">{formatPriceToIDR(subtotal)}</span>
                            </div>
                    
                            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                                <span className="text-xl font-extrabold text-gray-900">Order Total</span>
                                <span className="text-3xl font-extrabold text-rose-600">{formatPriceToIDR(total)}</span> 
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('/checkout')} 
                            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold py-4 mt-8 rounded-xl transition-all shadow-xl shadow-rose-300/60 hover:shadow-2xl"
                        >
                            Proceed to Checkout
                        </button>

                        <button
                            onClick={() => navigate('/shop')}
                            className="w-full text-indigo-600 border border-indigo-600 hover:bg-indigo-50 font-bold py-3 mt-4 rounded-xl transition-colors flex items-center justify-center"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" /> Continue Shopping
                        </button>
                        
                        <p className="text-xs text-gray-400 mt-6 text-center flex items-center justify-center">
                            <Zap className='w-3 h-3 mr-1'/> Data keranjang dimuat dari server (Diperlukan login).
                        </p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}