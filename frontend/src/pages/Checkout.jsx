import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Loader2, MapPin, CreditCard, Shield, CheckCircle,
    Truck, User, Phone, Mail, Zap, Scale
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

const formatWeight = (weight) => {
    const numWeight = typeof weight === 'string' ? Number(weight) : weight;
    if (numWeight >= 1000) {
        return (numWeight / 1000).toFixed(2) + ' kg';
    } else {
        return numWeight + ' g';
    }
};

export default function Checkout() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const [cartData, setCartData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [processing, setProcessing] = useState(false);

    const [shippingInfo, setShippingInfo] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        postalCode: '',
        notes: ''
    });

    const [paymentMethod] = useState('bank_transfer');
    const [shippingMethod, setShippingMethod] = useState('standard');

    const shippingCosts = {
        standard: 15000,
        express: 35000,
        same_day: 75000
    };

    const paymentMethods = [
        { id: 'bank_transfer', name: 'Bank Transfer', icon: '🏦' }
    ];
    
    const selectedPaymentMethod = paymentMethods.find(m => m.id === paymentMethod);

    const cartItems = cartData?.items?.map(item => ({
        product_id: item.product_id,
        name: item.product?.name || 'Unknown Product',
        price: item.price_at_addition || item.product?.price || 0,
        quantity: item.quantity,
        image: item.product?.image,
        unit: item.product?.unit || 'Unit',
        weight: item.product?.weight || 0
    })) || [];

    const loadCart = useCallback(async () => {
        setLoading(true);
        setError('');
        
        const token = localStorage.getItem('authToken');

        if (!isAuthenticated || !token) {
            setLoading(false);
            if (!isAuthenticated) {
                setError('Please log in to proceed to checkout.');
                setTimeout(() => navigate('/login'), 1500);
            }
            return;
        }

        try {
            const response = await cartService.getCart(token);
            
            if (response.success) {
                setCartData(response.cart);
                
                if (!response.cart.items || response.cart.items.length === 0) {
                    setError("Your cart is empty. Redirecting to shop.");
                    setTimeout(() => navigate('/shop'), 1500);
                }
            } else {
                setError(response.message || 'Failed to load cart data from server.');
                setCartData(null);
            }
        } catch (err) {
            console.error('Error loading cart:', err);
            setError('Failed to connect to server. Please try again.');
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

    const totalQuantity = cartItems.reduce((acc, item) => acc + (item.quantity || 0), 0);
    const subtotal = cartData?.total_price || cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const shippingCost = shippingCosts[shippingMethod] || 0;
    const total = subtotal + shippingCost;

    // Calculate total weight
    const totalWeight = cartItems.reduce((acc, item) => {
        return acc + (item.weight * item.quantity);
    }, 0);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setShippingInfo(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePlaceOrder = async () => {
        if (!shippingInfo.fullName || !shippingInfo.email || !shippingInfo.phone || !shippingInfo.address || !shippingInfo.city || !shippingInfo.postalCode) {
            alert('Please fill in all required shipping information.');
            return;
        }
        if (cartItems.length === 0) {
            alert('Your cart is empty.');
            navigate('/shop');
            return;
        }

        setProcessing(true);
        const token = localStorage.getItem('authToken');

        try {
            // Prepare order data for API
            const orderData = {
                shipping_info: shippingInfo,
                payment_method: paymentMethod,
                shipping_method: shippingMethod
            };

            console.log('📤 Sending order data to API:', orderData);

            // Call REAL order API
            const response = await fetch('http://localhost:8888/order/place', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData)
            });

            const result = await response.json();
            console.log('📦 Order API response:', result);

            if (result.success) {
                // Order berhasil - cart otomatis dikosongkan oleh backend
                setCartData(null);
                window.dispatchEvent(new Event('cartUpdated'));
                
                // Navigate to success page with order details
                navigate('/ordersuccess', { 
                    state: { 
                        orderNumber: result.order.order_number,
                        totalAmount: result.order.total_amount,
                        orderId: result.order.id
                    }
                });
            } else {
                alert(result.message || 'Failed to place order. Please try again.');
            }

        } catch (error) {
            console.error('❌ Error placing order:', error);
            alert('Failed to place order due to a network error. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 font-sans">
                <Navbar />
                <div className={HEADER_HEIGHT_PADDING} />
                <main className="w-full">
                    <div className="flex flex-col justify-center items-center h-96 bg-white">
                        <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mb-4" />
                        <p className="text-xl font-bold text-indigo-600">Loading Checkout...</p>
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
                        <h3 className="text-3xl font-extrabold text-red-900 mb-3">Checkout Error</h3>
                        <p className="text-red-700 mb-8">{error}</p>
                        <button 
                            onClick={() => navigate('/shop')} 
                            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" /> Continue Shopping
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
                        <CreditCard className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
                        <h3 className="text-3xl font-extrabold text-gray-900 mb-3">Your Cart is Empty!</h3>
                        <p className="text-gray-600 mb-8">Add some items to your cart before checking out.</p>
                        <button 
                            onClick={() => navigate('/shop')} 
                            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" /> Continue Shopping
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
                <div className="flex items-center mb-8">
                    <button 
                        onClick={() => navigate('/cart')}
                        className="flex items-center text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Cart
                    </button>
                    <h1 className="text-4xl font-extrabold text-gray-900 ml-4">
                        Checkout
                    </h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    
                    <div className="lg:col-span-2 space-y-8">
                        
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                            <div className="flex items-center mb-6">
                                <MapPin className="w-6 h-6 text-indigo-600 mr-3" />
                                <h2 className="text-2xl font-extrabold text-gray-900">Shipping Information</h2>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Full Name *
                                    </label>
                                    <div className="relative">
                                        <User className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={shippingInfo.fullName}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                            placeholder="Enter your full name"
                                            required
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address *
                                    </label>
                                    <div className="relative">
                                        <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={shippingInfo.email}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                            placeholder="your@email.com"
                                            required
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone Number *
                                    </label>
                                    <div className="relative">
                                        <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={shippingInfo.phone}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                            placeholder="+62 XXX-XXXX-XXXX"
                                            required
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Postal Code *
                                    </label>
                                    <input
                                        type="text"
                                        name="postalCode"
                                        value={shippingInfo.postalCode}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                        placeholder="12345"
                                        required
                                    />
                                </div>
                                
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Address *
                                    </label>
                                    <textarea
                                        name="address"
                                        value={shippingInfo.address}
                                        onChange={handleInputChange}
                                        rows="3"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                        placeholder="Enter your complete address"
                                        required
                                    />
                                </div>
                                
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        City *
                                    </label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={shippingInfo.city}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                        placeholder="Enter your city"
                                        required
                                    />
                                </div>
                                
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Order Notes (Optional)
                                    </label>
                                    <textarea
                                        name="notes"
                                        value={shippingInfo.notes}
                                        onChange={handleInputChange}
                                        rows="2"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                        placeholder="Any special instructions for your order..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                            <div className="flex items-center mb-6">
                                <Truck className="w-6 h-6 text-indigo-600 mr-3" />
                                <h2 className="text-2xl font-extrabold text-gray-900">Shipping Method</h2>
                            </div>
                            
                            <div className="space-y-4">
                                {[
                                    { id: 'standard', name: 'Standard Delivery', price: 15000, time: '3-5 business days' },
                                    { id: 'express', name: 'Express Delivery', price: 35000, time: '1-2 business days' },
                                    { id: 'same_day', name: 'Same Day Delivery', price: 75000, time: 'Same day' }
                                ].map((method) => (
                                    <label key={method.id} className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-colors ${shippingMethod === method.id ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-indigo-400'}`}>
                                        <input
                                            type="radio"
                                            name="shippingMethod"
                                            value={method.id}
                                            checked={shippingMethod === method.id}
                                            onChange={(e) => setShippingMethod(e.target.value)}
                                            className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <div className="ml-4 flex-1">
                                            <div className="flex justify-between items-center">
                                                <span className="font-semibold text-gray-900">{method.name}</span>
                                                <span className="font-bold text-indigo-600">{formatPriceToIDR(method.price)}</span>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">{method.time}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>

                            {/* Total Weight Information */}
                            {totalWeight > 0 && (
                                <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                                    <div className="flex items-center text-blue-700">
                                        <Scale className="w-5 h-5 mr-2" />
                                        <span className="font-semibold">Total Package Weight: {formatWeight(totalWeight)}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                            <div className="flex items-center mb-6">
                                <CreditCard className="w-6 h-6 text-indigo-600 mr-3" />
                                <h2 className="text-2xl font-extrabold text-gray-900">Payment Method</h2>
                            </div>
                            
                            {selectedPaymentMethod && (
                                <div className="flex items-center p-4 border-2 border-indigo-600 bg-indigo-50 rounded-xl">
                                    <span className="text-2xl ml-1 mr-3">{selectedPaymentMethod.icon}</span>
                                    <span className="font-bold text-gray-900 text-lg">{selectedPaymentMethod.name} (Selected)</span>
                                </div>
                            )}

                            <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                <p className="font-semibold text-gray-800 mb-2">Payment Details for Bank Transfer:</p>
                                <p className="text-sm text-gray-700">
                                    Please transfer the total amount to the account below. Your order will be processed after verification.
                                </p>
                                <ul className="mt-2 text-sm text-gray-700 space-y-1">
                                    <li><strong>Bank:</strong> BCA / Mandiri</li>
                                    <li><strong>Account Number:</strong> 123-456-7890 (PT. Online Store)</li>
                                    <li><strong>Total:</strong> <strong className='text-rose-600'>{formatPriceToIDR(total)}</strong></li>
                                </ul>
                                <p className="text-xs text-gray-500 mt-3">
                                    *Please complete payment within 24 hours.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 sticky top-28 p-8">
                            <h2 className="text-2xl font-extrabold text-gray-900 mb-6 border-b pb-3">Order Summary</h2>
                            
                            <div className="space-y-4 mb-6 max-h-80 overflow-y-auto">
                                {cartItems.map((item, index) => (
                                    <div key={item.product_id || index} className="flex items-center space-x-4 py-3 border-b border-gray-100 last:border-b-0">
                                        <img
                                            src={item.image ? 
                                                 (item.image.startsWith('http') ? item.image : `http://localhost:8888${item.image}`) 
                                                 : `https://via.placeholder.com/100x100?text=No+Image`}
                                            alt={item.name}
                                            className="w-16 h-16 object-cover rounded-lg flex-shrink-0 border border-gray-200"
                                            onError={(e) => {
                                                e.target.src = 'https://via.placeholder.com/100x100?text=No+Image';
                                            }}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                                            <p className="text-sm text-gray-600">
                                                {item.quantity} × {formatPriceToIDR(item.price)}
                                            </p>
                                            {item.weight > 0 && (
                                                <p className="text-xs text-gray-500">
                                                    Weight: {formatWeight(item.weight)}
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-rose-600">
                                                {formatPriceToIDR(item.price * item.quantity)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-3 text-gray-700 mb-6">
                                <div className="flex justify-between">
                                    <span>Subtotal ({totalQuantity} items)</span>
                                    <span className="font-semibold">{formatPriceToIDR(subtotal)}</span>
                                </div>
                                
                                <div className="flex justify-between">
                                    <span>Shipping</span>
                                    <span className="font-semibold">{formatPriceToIDR(shippingCost)}</span>
                                </div>
                                
                                <div className="border-t border-gray-200 pt-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xl font-extrabold text-gray-900">Total</span>
                                        <span className="text-2xl font-extrabold text-rose-600">{formatPriceToIDR(total)}</span>
                                    </div>
                                </div>
                            </div>

                            {totalWeight > 0 && (
                                <div className="mb-6 p-3 bg-gray-50 rounded-xl border border-gray-200">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Total Weight:</span>
                                        <span className="font-semibold text-gray-800">{formatWeight(totalWeight)}</span>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-center mb-6 p-3 bg-green-50 rounded-xl border border-green-200">
                                <Shield className="w-5 h-5 text-green-600 mr-2" />
                                <span className="text-sm font-medium text-green-700">Secure SSL Encryption</span>
                            </div>

                            <button
                                onClick={handlePlaceOrder}
                                disabled={processing}
                                className="w-full bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white font-extrabold py-4 rounded-xl transition-all shadow-xl shadow-rose-300/60 hover:shadow-2xl disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-5 h-5 mr-2" />
                                        Place Order
                                    </>
                                )}
                            </button>

                            <p className="text-xs text-gray-400 mt-4 text-center">
                                By placing your order, you agree to our Terms of Service and Privacy Policy.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}