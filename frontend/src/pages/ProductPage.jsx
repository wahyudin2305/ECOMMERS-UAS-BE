import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; 
import {
    ShoppingCart, Package, Star, Loader2, ArrowLeft, ArrowRight,
    Search, Filter, X, ChevronDown, ChevronUp, CheckCircle, Shield, Eye, Music
} from 'lucide-react';
import Navbar, { HEADER_HEIGHT_PADDING } from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext'; 
import { cartService } from '../services/CartService';

const API_BASE_URL = 'http://localhost:8888';
const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256'%3E%3Crect width='256' height='256' fill='%23374151'/%3E%3Ctext x='50%25' y='45%25' font-family='Arial' font-size='40' fill='%239CA3AF' text-anchor='middle'%3E🎸%3C/text%3E%3Ctext x='50%25' y='60%25' font-family='Arial' font-size='14' fill='%239CA3AF' text-anchor='middle'%3ENo Image%3C/text%3E%3C/svg%3E";

const apiService = {
    getProducts: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/product/list`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        } catch (error) {
            console.error('Error fetching products:', error);
            return { success: false, products: [], error: 'Network or server error' };
        }
    },
};

const formatPriceToIDR = (price) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price);
};

// Cart Notification
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

// Product Card
const ProductCard = ({ product, onProductClick, onAddToCart }) => {
    const hasDiscount = product.price % 3 !== 0; 
    const discountPercentage = Math.round(Math.random() * 20 + 10);
    
    const productImageUrl = (product.image && product.image.startsWith('/'))
        ? `${API_BASE_URL}${product.image}`
        : PLACEHOLDER_IMAGE;

    return (
        <div 
            className="bg-white p-4 rounded-3xl transition-all duration-500 shadow-xl hover:shadow-amber-200/50 hover:scale-[1.02] border border-stone-200 relative overflow-hidden group cursor-pointer"
            onClick={() => onProductClick(product.id)}
        >
            {hasDiscount && (
                <div className="absolute top-4 right-4 z-20">
                    <span className="bg-red-500 text-white text-xs font-bold px-3 py-2 rounded-2xl shadow-lg">
                        -{discountPercentage}%
                    </span>
                </div>
            )}

            <div className="bg-gradient-to-br from-stone-100 to-stone-200 rounded-2xl mb-4 flex items-center justify-center h-56 relative overflow-hidden border border-stone-200">
                <img
                    src={productImageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover transition-all duration-500 group-hover:scale-110"
                    onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                />

                <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center space-x-3 opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <button 
                        className="p-3 bg-white rounded-2xl text-gray-700 hover:text-amber-600 shadow-lg transition-all hover:scale-110"
                        onClick={(e) => { e.stopPropagation(); onProductClick(product.id); }}
                    >
                        <Eye className="w-5 h-5" />
                    </button>
                    <button 
                        className="p-3 bg-amber-500 rounded-2xl text-white hover:bg-amber-600 shadow-lg transition-all hover:scale-110"
                        onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
                    >
                        <ShoppingCart className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="space-y-2">
                <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                    {product.category_name || 'GUITAR'}
                </p>
                <h3 className="text-lg font-black text-gray-900 line-clamp-2 leading-tight group-hover:text-amber-700 transition-colors">
                    {product.name}
                </h3>
                <div className="flex items-center space-x-2">
                    <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                    </div>
                    <span className="text-sm text-gray-500">({Math.floor(Math.random() * 50) + 10})</span>
                </div>
                <div className="flex items-center justify-between pt-2">
                    <span className="text-xl font-black text-amber-600">{formatPriceToIDR(product.price)}</span>
                </div>
            </div>
        </div>
    );
};

// Filter Sidebar
const FilterSidebar = ({ filters, onFilterChange, categories, maxPrice, isMobileFilterOpen, onCloseMobileFilter }) => {
    const [expandedSections, setExpandedSections] = useState({
        categories: true,
        price: true,
        rating: false
    });

    const toggleSection = (section) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const handleCategoryChange = (categoryName) => {
        const updatedCategories = filters.categories.includes(categoryName)
            ? filters.categories.filter(c => c !== categoryName)
            : [...filters.categories, categoryName];
        onFilterChange({ ...filters, categories: updatedCategories });
    };

    const handlePriceChange = (value) => {
        onFilterChange({ ...filters, priceRange: { min: 0, max: parseInt(value) } });
    };

    const FilterContent = () => (
        <div className="space-y-6">
            {/* Categories */}
            <div className="border-b border-stone-200 pb-6">
                <button onClick={() => toggleSection('categories')} className="flex items-center justify-between w-full text-left mb-4">
                    <span className="text-lg font-bold text-gray-900 flex items-center">
                        <Music className="w-5 h-5 mr-2 text-amber-600" /> Categories
                    </span>
                    {expandedSections.categories ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                {expandedSections.categories && (
                    <div className="space-y-3">
                        {categories.map((category, index) => (
                            <label key={index} className="flex items-center cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={filters.categories.includes(category.toUpperCase())}
                                    onChange={() => handleCategoryChange(category.toUpperCase())}
                                    className="w-4 h-4 text-amber-600 border-stone-300 rounded focus:ring-amber-500"
                                />
                                <span className="ml-3 text-gray-700 group-hover:text-amber-600 transition-colors font-medium">{category}</span>
                            </label>
                        ))}
                    </div>
                )}
            </div>

            {/* Price Range */}
            <div className="border-b border-stone-200 pb-6">
                <button onClick={() => toggleSection('price')} className="flex items-center justify-between w-full text-left mb-4">
                    <span className="text-lg font-bold text-gray-900">💰 Price Range</span>
                    {expandedSections.price ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                {expandedSections.price && (
                    <div className="space-y-4">
                        <input
                            type="range"
                            min="0"
                            max={maxPrice}
                            value={filters.priceRange?.max || maxPrice}
                            onChange={(e) => handlePriceChange(e.target.value)}
                            className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                        />
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Rp0</span>
                            <span className="font-bold text-amber-600">{formatPriceToIDR(filters.priceRange?.max || maxPrice)}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Rating */}
            <div>
                <button onClick={() => toggleSection('rating')} className="flex items-center justify-between w-full text-left mb-4">
                    <span className="text-lg font-bold text-gray-900">⭐ Rating</span>
                    {expandedSections.rating ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                {expandedSections.rating && (
                    <div className="space-y-2">
                        {[4, 3, 2, 1].map(rating => (
                            <label key={rating} className="flex items-center cursor-pointer group">
                                <input
                                    type="radio"
                                    name="rating"
                                    checked={filters.minRating === rating}
                                    onChange={() => onFilterChange({ ...filters, minRating: rating })}
                                    className="w-4 h-4 text-amber-600 border-stone-300 focus:ring-amber-500"
                                />
                                <span className="ml-3 flex items-center">
                                    {[...Array(rating)].map((_, i) => <Star key={i} className="w-4 h-4 text-amber-400 fill-current" />)}
                                    <span className="ml-2 text-gray-600">& Up</span>
                                </span>
                            </label>
                        ))}
                    </div>
                )}
            </div>

            {/* Clear Filters */}
            <button
                onClick={() => onFilterChange({ categories: [], priceRange: null, minRating: 0, searchQuery: '' })}
                className="w-full py-3 text-amber-600 border-2 border-amber-500 rounded-xl font-bold hover:bg-amber-50 transition-colors"
            >
                Clear All Filters
            </button>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <div className="hidden lg:block bg-white p-6 rounded-2xl shadow-lg border border-stone-200 sticky top-28">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <Filter className="w-6 h-6 mr-2 text-amber-600" /> Filters
                </h2>
                <FilterContent />
            </div>

            {/* Mobile Filter Modal */}
            {isMobileFilterOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black/50" onClick={onCloseMobileFilter}></div>
                    <div className="absolute right-0 top-0 h-full w-80 bg-white p-6 overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Filters</h2>
                            <button onClick={onCloseMobileFilter}><X className="w-6 h-6" /></button>
                        </div>
                        <FilterContent />
                    </div>
                </div>
            )}
        </>
    );
};

// Main Component
export default function ProductPage() {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [notification, setNotification] = useState({ isVisible: false, message: '' });
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 12;

    const [filters, setFilters] = useState({
        categories: [],
        priceRange: null,
        minRating: 0,
        searchQuery: ''
    });

    // Parse URL params for category filter
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const categoryParam = searchParams.get('category');
        if (categoryParam) {
            setFilters(prev => ({
                ...prev,
                categories: [categoryParam.toUpperCase()]
            }));
        }
    }, [location.search]);

    useEffect(() => {
        const loadProducts = async () => {
            setLoading(true);
            const response = await apiService.getProducts();
            if (response.success) {
                setProducts(response.products);
            } else {
                setError(response.error || 'Failed to load products');
            }
            setLoading(false);
        };
        loadProducts();
    }, []);

    const categories = useMemo(() => {
        const uniqueCategories = [...new Set(products.map(p => p.category_name).filter(Boolean))];
        return uniqueCategories;
    }, [products]);

    const maxPrice = useMemo(() => {
        return Math.max(...products.map(p => p.price), 100000000);
    }, [products]);

    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            if (filters.categories.length > 0 && !filters.categories.includes(product.category_name?.toUpperCase())) {
                return false;
            }
            if (filters.priceRange && product.price > filters.priceRange.max) {
                return false;
            }
            if (filters.searchQuery && !product.name.toLowerCase().includes(filters.searchQuery.toLowerCase())) {
                return false;
            }
            return true;
        });
    }, [products, filters]);

    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    const paginatedProducts = filteredProducts.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage);

    const handleProductClick = useCallback((productId) => {
        navigate(`/product/${productId}`);
    }, [navigate]);

    const handleAddToCart = useCallback(async (product) => {
        if (!isAuthenticated) {
            setNotification({ isVisible: true, message: "Please log in first to add items to your cart." });
            setTimeout(() => navigate('/login'), 1000);
            return;
        }

        try {
            const token = localStorage.getItem('authToken');
            const response = await cartService.addToCart(product.id, 1, token);
            setNotification({ isVisible: true, message: response.message || `${product.name} added to cart! 🎸` });
            window.dispatchEvent(new Event('cartUpdated'));
        } catch (err) {
            setNotification({ isVisible: true, message: err.message || 'Failed to add item to cart.' });
        }
    }, [isAuthenticated, navigate]);

    const closeNotification = useCallback(() => {
        setNotification({ isVisible: false, message: '' });
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-stone-50 font-sans">
                <Navbar />
                <div className={HEADER_HEIGHT_PADDING} />
                <main className="max-w-7xl mx-auto px-4 py-20">
                    <div className="flex flex-col justify-center items-center h-64 bg-white rounded-3xl shadow-xl">
                        <Loader2 className="w-12 h-12 animate-spin text-amber-600 mb-4" />
                        <p className="text-xl font-black text-amber-600">Loading Guitars...</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-50 font-sans">
            <Navbar />
            <CartNotification message={notification.message} isVisible={notification.isVisible} onClose={closeNotification} />
            <div className={HEADER_HEIGHT_PADDING} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                
                {/* Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 border-b border-stone-200 pb-8 space-y-4 lg:space-y-0">
                    <div>
                        <h1 className="text-4xl font-extrabold text-gray-900 flex items-center space-x-3">
                            <span className="text-3xl">🎸</span>
                            <span>All Guitars ({filteredProducts.length})</span>
                        </h1>
                        <p className="text-lg text-gray-600 mt-2">Find your perfect sound from our premium collection</p>
                    </div>

                    <div className="flex flex-wrap gap-4 w-full lg:w-auto">
                        <div className="relative flex-1 lg:w-64">
                            <input 
                                type="text" 
                                placeholder="Search guitars..." 
                                value={filters.searchQuery}
                                onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                                className="pl-12 pr-4 py-3 border border-stone-300 rounded-xl w-full focus:ring-amber-500 focus:border-amber-500"
                            />
                            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                        </div>
                        <button 
                            className="flex items-center space-x-2 bg-amber-500 text-white font-semibold py-3 px-6 rounded-xl hover:bg-amber-600 transition-colors lg:hidden"
                            onClick={() => setIsMobileFilterOpen(true)}
                        >
                            <Filter className="w-5 h-5" />
                            <span>Filter</span>
                        </button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filter Sidebar */}
                    <div className="lg:w-80 flex-shrink-0">
                        <FilterSidebar
                            filters={filters}
                            onFilterChange={setFilters}
                            categories={categories}
                            maxPrice={maxPrice}
                            isMobileFilterOpen={isMobileFilterOpen}
                            onCloseMobileFilter={() => setIsMobileFilterOpen(false)}
                        />
                    </div>

                    {/* Product Grid */}
                    <div className="flex-1">
                        {/* Active Filters */}
                        {(filters.categories.length > 0 || filters.searchQuery) && (
                            <div className="mb-6 flex flex-wrap gap-2">
                                {filters.searchQuery && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                        Search: "{filters.searchQuery}"
                                        <button onClick={() => setFilters({ ...filters, searchQuery: '' })} className="ml-2 hover:text-amber-600">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                )}
                                {filters.categories.map(category => (
                                    <span key={category} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                        {category}
                                        <button onClick={() => setFilters({ ...filters, categories: filters.categories.filter(c => c !== category) })} className="ml-2 hover:text-orange-600">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}

                        {paginatedProducts.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                                    {paginatedProducts.map((product, index) => (
                                        <ProductCard 
                                            key={product.id || index} 
                                            product={product} 
                                            onProductClick={handleProductClick} 
                                            onAddToCart={handleAddToCart}
                                        />
                                    ))}
                                </div>
                                
                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex justify-center items-center space-x-4 mt-12">
                                        <button
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="p-3 rounded-xl bg-white border border-stone-200 disabled:opacity-50 hover:bg-amber-50 transition-colors"
                                        >
                                            <ArrowLeft className="w-5 h-5" />
                                        </button>
                                        <span className="font-bold text-gray-700">
                                            Page {currentPage} of {totalPages}
                                        </span>
                                        <button
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            className="p-3 rounded-xl bg-white border border-stone-200 disabled:opacity-50 hover:bg-amber-50 transition-colors"
                                        >
                                            <ArrowRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-3xl shadow-xl border border-stone-200">
                                <div className="text-6xl mb-4">🎸</div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">No Guitars Found</h3>
                                <p className="text-gray-600 mb-4">Try adjusting your filters or search terms.</p>
                                <button
                                    onClick={() => setFilters({ categories: [], priceRange: null, minRating: 0, searchQuery: '' })}
                                    className="text-amber-600 hover:text-amber-700 font-medium"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}