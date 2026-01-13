import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ShoppingCart, Heart, Truck, Headset, CheckCircle, Star,
    ArrowLeft, Loader2, RefreshCw, Shield, Clock,
    Share2, Minus, Plus, Award, Music, Scale
} from 'lucide-react';

import Navbar, { HEADER_HEIGHT_PADDING } from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { cartService } from '../services/CartService';

const API_BASE_URL = 'http://localhost:8888';
const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect width='400' height='400' fill='%23374151'/%3E%3Ctext x='50%25' y='45%25' font-family='Arial' font-size='60' fill='%239CA3AF' text-anchor='middle'%3E🎸%3C/text%3E%3Ctext x='50%25' y='60%25' font-family='Arial' font-size='20' fill='%239CA3AF' text-anchor='middle'%3ENo Image%3C/text%3E%3C/svg%3E";

const apiService = {
    getProductDetail: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/product/${id}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        } catch (error) {
            console.error('Error fetching product detail:', error);
            return { success: false, error: 'Network or server error' };
        }
    }
};

const formatPriceToIDR = (price) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price);
};

const formatWeight = (weight) => {
    const numWeight = typeof weight === 'string' ? Number(weight) : weight;
    if (numWeight >= 1000) return (numWeight / 1000).toFixed(2) + ' kg';
    return numWeight + ' g';
};

const CartNotification = ({ message, isVisible, onClose }) => {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => onClose(), 3000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    if (!isVisible) return null;

    const isError = message.includes("Please log in") || message.includes("Failed");
    const bgColorClass = isError ? "bg-red-600" : "bg-amber-600";

    return (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
            <div className={`flex items-center text-white text-sm font-bold px-6 py-3 rounded-full shadow-2xl space-x-3 ${bgColorClass}`}>
                {isError ? <Shield className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                <span>{message}</span>
                <button onClick={onClose} className="ml-2 text-white/80 hover:text-white font-extrabold">&times;</button>
            </div>
        </div>
    );
};

export default function ViewProduct() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [isLiked, setIsLiked] = useState(false);
    const [notification, setNotification] = useState({ isVisible: false, message: '' });

    const closeNotification = useCallback(() => {
        setNotification({ isVisible: false, message: '' });
    }, []);

    useEffect(() => {
        const loadProductDetail = async () => {
            setLoading(true);
            setError('');
            
            const response = await apiService.getProductDetail(id);
            
            if (response.success && response.product) {
                setProduct(response.product);
            } else {
                setError(response.error || 'Product not found');
            }
            setLoading(false);
        };

        if (id) loadProductDetail();
    }, [id]);

    const handleAddToCart = useCallback(async () => {
        if (!isAuthenticated) {
            setNotification({ isVisible: true, message: "Please log in first to add items to your cart." });
            setTimeout(() => navigate('/login'), 1000);
            return;
        }

        if (!product) return;
        
        try {
            const token = localStorage.getItem('authToken');
            const response = await cartService.addToCart(product.id, quantity, token);
            
            if (response.success) {
                setNotification({ isVisible: true, message: response.message || `${quantity} ${product.name} added to cart! 🎸` });
                window.dispatchEvent(new Event('cartUpdated'));
            } else {
                setNotification({ isVisible: true, message: response.message || 'Failed to add to cart.' });
            }
        } catch (err) {
            setNotification({ isVisible: true, message: err.message || 'Failed to add item to cart.' });
        }
    }, [isAuthenticated, navigate, product, quantity]);

    const handleBuyNow = useCallback(async () => {
        await handleAddToCart();
        if (isAuthenticated) {
            setTimeout(() => navigate('/checkout'), 500);
        }
    }, [handleAddToCart, isAuthenticated, navigate]);

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({ title: product?.name, url: window.location.href });
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-stone-50 font-sans">
                <Navbar />
                <div className={HEADER_HEIGHT_PADDING} />
                <main className="max-w-7xl mx-auto px-4 py-20">
                    <div className="flex flex-col justify-center items-center h-64 bg-white rounded-3xl shadow-xl">
                        <Loader2 className="w-12 h-12 animate-spin text-amber-600 mb-4" />
                        <p className="text-xl font-black text-amber-600">Loading Product...</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen bg-stone-50 font-sans">
                <Navbar />
                <div className={HEADER_HEIGHT_PADDING} />
                <main className="max-w-4xl mx-auto px-4 py-20">
                    <div className="text-center p-12 bg-white rounded-3xl shadow-xl border border-stone-200">
                        <div className="text-6xl mb-4">🎸</div>
                        <h3 className="text-2xl font-extrabold text-gray-900 mb-3">{error || 'Product not found'}</h3>
                        <button onClick={() => navigate('/shop')} className="inline-flex items-center px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Shop
                        </button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    const discountPercent = 15;
    const originalPrice = product.price / (1 - discountPercent / 100);
    const discountedPrice = product.price;

    const productImageUrl = (product.image && product.image.startsWith('/'))
        ? `${API_BASE_URL}${product.image}`
        : (product.image || PLACEHOLDER_IMAGE);

    const featuresList = [
        { icon: Award, text: '100% Original Product' },
        { icon: RefreshCw, text: '7 Days Easy Return' },
        { icon: Truck, text: 'Free Shipping Nationwide' },
        { icon: Shield, text: '1 Year Warranty' },
        { icon: Headset, text: '24/7 Expert Support' },
        { icon: Clock, text: 'Express Delivery Available' },
    ];

    return (
        <div className="min-h-screen bg-stone-50 font-sans">
            <Navbar />
            <CartNotification message={notification.message} isVisible={notification.isVisible} onClose={closeNotification} />
            <div className={HEADER_HEIGHT_PADDING} />

            <main>
                {/* Breadcrumb */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <button onClick={() => navigate('/')} className="hover:text-amber-600">Home</button>
                        <span>/</span>
                        <button onClick={() => navigate('/shop')} className="hover:text-amber-600">Shop</button>
                        <span>/</span>
                        <span className="text-amber-600 font-medium">{product.name}</span>
                    </div>
                </div>

                {/* Product Detail */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                    <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
                            
                            {/* Image */}
                            <div className="space-y-4">
                                <div className="bg-gradient-to-br from-stone-100 to-stone-200 rounded-2xl overflow-hidden h-[500px] flex items-center justify-center">
                                    <img
                                        src={productImageUrl}
                                        alt={product.name}
                                        className="h-full w-full object-cover"
                                        onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                                    />
                                </div>
                            </div>

                            {/* Info */}
                            <div className="flex flex-col justify-center">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="bg-amber-100 text-amber-700 text-sm font-bold px-4 py-2 rounded-full flex items-center">
                                        <Music className="w-4 h-4 mr-2" />
                                        {product.category_name || 'Guitar'}
                                    </span>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => setIsLiked(!isLiked)}
                                            className={`p-3 rounded-full transition-colors shadow-sm ${isLiked ? 'bg-red-100 text-red-500' : 'bg-stone-100 hover:bg-stone-200 text-gray-600'}`}
                                        >
                                            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                                        </button>
                                        <button onClick={handleShare} className="p-3 bg-stone-100 hover:bg-stone-200 rounded-full transition-colors shadow-sm">
                                            <Share2 className="w-5 h-5 text-gray-600" />
                                        </button>
                                    </div>
                                </div>

                                <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4">{product.name}</h1>
                                
                                <div className="flex flex-wrap items-center space-x-4 mb-6 pb-6 border-b border-stone-200">
                                    <div className="flex items-center text-amber-400">
                                        {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
                                    </div>
                                    <span className="text-lg font-bold text-gray-900">{product.rating || 4.8}</span>
                                    <span className="text-base text-gray-500">({product.reviews || 50} Reviews)</span>
                                    <span className="text-base text-green-600 font-semibold flex items-center">
                                        <CheckCircle className="w-4 h-4 mr-1" />
                                        In Stock ({product.stock || 0})
                                    </span>
                                    {product.weight && (
                                        <span className="text-base text-gray-600 font-semibold flex items-center">
                                            <Scale className="w-4 h-4 mr-1" />
                                            {formatWeight(product.weight)}
                                        </span>
                                    )}
                                </div>

                                <div className="mb-8">
                                    <p className="text-lg text-gray-500 line-through font-medium mb-1">{formatPriceToIDR(originalPrice)}</p>
                                    <p className="text-4xl font-extrabold text-amber-600 mb-2">{formatPriceToIDR(discountedPrice)}</p>
                                    <p className="text-gray-600 text-sm">Harga sudah termasuk PPN</p>
                                </div>

                                <div className="mb-8">
                                    <h3 className="text-lg font-bold text-gray-900 mb-3">Quantity</h3>
                                    <div className="flex items-center space-x-6">
                                        <div className="flex items-center border border-stone-300 rounded-full bg-stone-50">
                                            <button 
                                                className="p-3 text-gray-600 hover:bg-stone-100 rounded-full disabled:opacity-30"
                                                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                                disabled={quantity <= 1}
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <input
                                                type="number"
                                                value={quantity}
                                                onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock || 1, parseInt(e.target.value) || 1)))}
                                                className="w-12 text-center font-extrabold text-gray-900 bg-transparent focus:outline-none"
                                                min="1"
                                                max={product.stock || 1}
                                            />
                                            <button 
                                                className="p-3 text-gray-600 hover:bg-stone-100 rounded-full disabled:opacity-30"
                                                onClick={() => setQuantity(q => Math.min(product.stock || 1, q + 1))}
                                                disabled={quantity >= (product.stock || 1)}
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <span className="text-base text-gray-600 font-semibold">{product.unit || 'Unit'}</span>
                                    </div>
                                </div>

                                <div className="flex space-x-4 mb-8">
                                    <button
                                        onClick={handleAddToCart}
                                        className="flex-1 flex items-center justify-center bg-white border-2 border-amber-500 text-amber-600 hover:bg-amber-50 font-bold py-4 rounded-xl transition-all shadow-md hover:shadow-lg"
                                    >
                                        <ShoppingCart className="w-5 h-5 mr-3" /> Add to Cart
                                    </button>
                                    <button
                                        onClick={handleBuyNow}
                                        className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-extrabold py-4 rounded-xl transition-all shadow-xl shadow-amber-300/50 hover:shadow-2xl"
                                    >
                                        Buy Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                    <div className="p-8 bg-white rounded-3xl border border-stone-200 shadow-xl">
                        <h2 className="text-3xl font-extrabold text-gray-900 mb-6 border-b-4 border-amber-100 pb-3">🎸 Product Description</h2>
                        <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-wrap">
                            {product.description || "No description available for this product."}
                        </p>
                    </div>
                </div>

                {/* Features */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                    <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-lg">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center text-amber-600">
                            <Shield className="w-6 h-6 mr-2" /> Our Promise
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {featuresList.map((feature, index) => (
                                <div key={index} className="flex items-center space-x-3 p-3 rounded-xl bg-amber-50 border border-amber-100">
                                    <feature.icon className="w-5 h-5 text-amber-500 flex-shrink-0" />
                                    <div className="text-sm text-gray-700 font-medium">{feature.text}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}