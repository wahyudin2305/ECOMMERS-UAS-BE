import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    Menu, X, ShoppingCart, User, Search, ChevronDown, Package, List, 
    Music, Guitar, Mic2, Speaker, Headphones, Radio
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx'; 
import { cartService } from '../services/CartService'; 

export const HEADER_HEIGHT_PADDING = "pt-[136px]"; 

const API_BASE_URL = 'http://localhost:8888'; 

// --- Helper Function: Get Initials ---
const getInitials = (name) => {
    if (!name) return 'GS'; 
    const parts = name.split(' ').filter(p => p.length > 0);
    if (parts.length >= 2) {
        return parts[0][0].toUpperCase() + parts[1][0].toUpperCase();
    }
    if (parts.length === 1) {
        return parts[0].substring(0, 2).toUpperCase();
    }
    return 'GS';
};

// --- Navigation Links ---
const bottomNavLinks = [
    { title: 'Home', href: '/', isDropdown: false },
    { title: 'Shop', href: '/shop', isDropdown: false },
    { title: 'Best Seller', href: '/best', isDropdown: false, isHighlight: true, badge: 'HOT' },
    { title: 'About', href: '/about', isDropdown: false },
    { title: 'Contact', href: '/contact', isDropdown: false },
];

// --- DropdownLink Component ---
const DropdownLink = ({ link }) => {
    const [isOpen, setIsOpen] = useState(false);
    const hasDropdown = link.isDropdown;
    const isHighlight = link.isHighlight;

    const linkClasses = `flex items-center text-sm font-semibold transition-colors duration-200 h-full ${
        isHighlight 
            ? 'text-red-600 group-hover:text-amber-600'
            : 'text-neutral-700 group-hover:text-amber-600'
    }`;
    
    const LinkComponent = link.href.startsWith('/') && link.href !== '#' ? Link : 'a';

    return (
        <div 
            className="relative h-full flex items-center z-30 group px-3"
            onMouseEnter={() => hasDropdown && setIsOpen(true)}
            onMouseLeave={() => hasDropdown && setIsOpen(false)}
        >
            {!isHighlight && (
                <span 
                    className="absolute left-0 top-0 h-0.5 bg-amber-500 transition-all duration-300 ease-out group-hover:w-full w-0"
                ></span>
            )}
            
            <LinkComponent 
                to={LinkComponent === Link ? link.href : undefined} 
                href={LinkComponent === 'a' ? link.href : undefined} 
                className={linkClasses}
            >
                {link.title}
                {hasDropdown && <ChevronDown className={`ml-1 w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />}
                {link.badge && (
                    <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full uppercase animate-pulse">
                        {link.badge}
                    </span>
                )}
            </LinkComponent>

            {hasDropdown && isOpen && (
                <div className="absolute top-full mt-1 w-40 bg-white border border-stone-200 shadow-lg rounded-lg overflow-hidden z-50">
                    {link.dropdownItems.map((item, index) => (
                        <a 
                            key={index} 
                            href="#" 
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                        >
                            {item}
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
};

// --- All Categories Dropdown ---
const AllCategoriesDropdown = ({ apiCategories }) => {
    const [isOpen, setIsOpen] = useState(false);

    if (apiCategories.length === 0) return null;

    return (
        <div 
            className="relative h-12 flex items-center z-50 flex-shrink-0"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
        >
            <button 
                className="flex items-center h-full px-4 py-2 text-sm font-semibold text-neutral-700 bg-stone-100 hover:bg-amber-100 hover:text-amber-700 transition-colors duration-200 border border-stone-200 rounded-lg whitespace-nowrap"
                aria-label="All Categories"
            >
                <List className="w-4 h-4 mr-2 text-amber-600" />
                Categories
                <ChevronDown className={`ml-2 w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-stone-200 shadow-xl rounded-lg z-50 overflow-hidden">
                    <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2">
                        <p className="text-white font-bold text-sm">🎸 Guitar Categories</p>
                    </div>
                    {apiCategories.map((category) => (
                        <Link
                            key={category.id}
                            to={`/shop?category=${encodeURIComponent(category.name.toUpperCase())}`}
                            className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600 transition-colors border-b border-stone-100 last:border-b-0"
                            onClick={() => setIsOpen(false)}
                        >
                            <Music className="w-4 h-4 mr-3 text-amber-500" />
                            <span className="font-medium">{category.name}</span>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

// --- Main Navbar Component ---
export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false); 
    const [categories, setCategories] = useState([]); 
    const { isAuthenticated, user, logout } = useAuth(); 
    const navigate = useNavigate();
    const [cartCount, setCartCount] = useState(0); 

    const fetchCategories = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/category/list`); 
            const data = await response.json();
            
            if (data.success && Array.isArray(data.categories)) {
                setCategories(data.categories);
            } else {
                setCategories([]); 
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            setCategories([]); 
        }
    };

    const fetchCartCount = useCallback(async () => {
        if (!isAuthenticated) {
            setCartCount(0);
            return;
        }

        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                setCartCount(0);
                return;
            }
            const response = await cartService.getCartCount(token);
            
            if (response.success && typeof response.count === 'number') {
                setCartCount(response.count); 
            } else {
                setCartCount(0);
            }
        } catch (error) {
            console.error("Failed to fetch cart count:", error);
            setCartCount(0);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        fetchCategories(); 
        fetchCartCount();
        
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 136); 
        };

        const handleCartUpdate = () => {
            fetchCartCount();
        };

        window.addEventListener('scroll', handleScroll);
        window.addEventListener('cartUpdated', handleCartUpdate);
        
        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('cartUpdated', handleCartUpdate);
        };
    }, [fetchCartCount]);
    
    const handleLogoutAndRedirect = () => {
        logout(); 
        setCartCount(0);
        navigate('/login'); 
    };

    const regularLinks = bottomNavLinks.filter(link => !link.isHighlight);
    const highlightLink = bottomNavLinks.find(link => link.isHighlight);

    const userDisplayName = user?.username || 'Account';
    const initials = getInitials(user?.username); 
    const isAdmin = user?.role === 'admin';

    // ==================== TOP HEADER ====================
    const TopHeader = (
        <div className="h-20 flex items-center py-4">
            {/* Logo - Guitar Store */}
            <Link to="/" className="flex items-center flex-shrink-0 mr-6 group">
                <div className="bg-gradient-to-br from-amber-500 to-orange-600 w-10 h-10 rounded-xl flex items-center justify-center text-white mr-3 shadow-lg group-hover:shadow-amber-300/50 transition-shadow">
                    <span className="text-xl">🎸</span>
                </div>
                <div>
                    <span className="text-xl font-black tracking-tight text-neutral-900 group-hover:text-amber-600 transition-colors">
                        GuitarStore
                    </span>
                    <p className="text-xs text-stone-500 -mt-1">Find Your Sound</p>
                </div>
            </Link>

            {/* Categories Dropdown */}
            <div className='hidden lg:flex flex-shrink-0 ml-4'> 
                <AllCategoriesDropdown apiCategories={categories} />
            </div>

            {/* Search Bar */}
            <div className="flex-grow max-w-xl hidden lg:flex h-11 border border-stone-200 rounded-xl overflow-hidden shadow-sm mx-6 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-100 transition-all">
                <input
                    type="search"
                    placeholder="Search guitars, amps, accessories..."
                    className="flex-grow px-4 text-sm text-neutral-800 focus:outline-none bg-white placeholder-stone-400"
                />
                <button className="flex items-center justify-center px-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 transition-colors">
                    <Search className="w-5 h-5" />
                </button>
            </div>

            {/* Action Icons */}
            <div className="flex items-center space-x-5 ml-auto z-40"> 
                
                {/* User Account */}
                {isAuthenticated ? (
                    <div className="relative group flex items-center z-[60] h-full"> 
                        <div className="flex items-center h-full cursor-pointer">
                            <div 
                                className="w-9 h-9 rounded-full border-2 border-amber-500 flex items-center justify-center font-bold text-white bg-gradient-to-br from-amber-500 to-orange-500 text-sm transition-transform hover:scale-105 shadow-md"
                                title={userDisplayName}
                            >
                                {initials}
                            </div>
                            <div className="hidden sm:block ml-2">
                                <p className="text-xs text-stone-500">Welcome back</p>
                                <p className="text-sm font-semibold text-neutral-800 truncate max-w-[100px]">{userDisplayName}</p>
                            </div>
                        </div>

                        {/* Dropdown Menu */}
                        <div className="absolute top-0 right-0 w-44 pt-12 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto z-50">
                            <div className="bg-white border border-stone-200 shadow-xl rounded-xl overflow-hidden">
                                <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2">
                                    <p className="text-white font-semibold text-sm truncate">{userDisplayName}</p>
                                </div>
                                <Link to="/profile" className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600">
                                    <User className="w-4 h-4 mr-2" />
                                    My Profile
                                </Link>
                                <Link to="/orders" className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600">
                                    <Package className="w-4 h-4 mr-2" />
                                    My Orders
                                </Link>
                                
                                {isAdmin && (
                                    <Link to="/admin" className="flex items-center px-4 py-2.5 text-sm text-amber-600 font-semibold hover:bg-amber-50 border-t border-stone-100">
                                        <span className="mr-2">⚙️</span>
                                        Admin Dashboard
                                    </Link>
                                )}

                                <button 
                                    onClick={handleLogoutAndRedirect} 
                                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-semibold border-t border-stone-100"
                                >
                                    Log Out
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <Link to="/login" className="flex items-center text-neutral-700 hover:text-amber-600 transition-colors group">
                        <div className="w-9 h-9 rounded-full bg-stone-100 group-hover:bg-amber-100 flex items-center justify-center transition-colors">
                            <User className="w-5 h-5" />
                        </div>
                        <div className="hidden sm:block ml-2 text-sm">
                            <p className="text-xs text-stone-500">Account</p>
                            <p className="font-semibold whitespace-nowrap group-hover:text-amber-600">Sign In</p>
                        </div>
                    </Link>
                )}

                {/* Cart */}
                <Link to="/cart" className="relative text-neutral-700 hover:text-amber-600 transition-colors group">
                    <div className="w-9 h-9 rounded-full bg-stone-100 group-hover:bg-amber-100 flex items-center justify-center transition-colors">
                        <ShoppingCart className="w-5 h-5" />
                    </div>
                    {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-full shadow-md">
                            {cartCount}
                        </span>
                    )}
                </Link>

                {/* Mobile Menu Toggle */}
                <button
                    className="lg:hidden text-neutral-700 hover:text-amber-600"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Menu Mobile"
                >
                    {isMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
                </button>
            </div>
        </div>
    );

    // ==================== BOTTOM NAV ====================
    const BottomNav = (
        <nav className="h-12 border-t border-stone-100 hidden lg:flex items-center justify-between max-w-7xl mx-auto px-6 lg:px-8 z-30">
            <div className="flex space-x-2 h-full">
                {regularLinks.map((link, index) => (
                    <DropdownLink key={index} link={link} />
                ))}
            </div>
            
            {highlightLink && (
                <div className="flex-shrink-0">
                    <DropdownLink link={highlightLink} />
                </div>
            )}
        </nav>
    );

    return (
        <>
            {/* Main Header */}
            <header 
                className={`fixed top-0 left-0 w-full bg-white/95 backdrop-blur-sm transition-all duration-300 z-40 ${
                    isScrolled ? 'shadow-xl' : 'shadow-md border-b border-stone-100'
                }`}
            >
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    {TopHeader}
                </div>

                <div className={`transition-all duration-300 ${isScrolled ? 'hidden' : 'block'}`}>
                    {BottomNav}
                </div>
            </header>
            
            {/* ==================== MOBILE MENU ==================== */}
            <div className={`fixed inset-0 bg-white transform transition-transform duration-300 ease-in-out lg:hidden z-50 ${
                isMenuOpen ? 'translate-x-0' : 'translate-x-full'
            }`}>
                {/* Mobile Header */}
                <div className="flex justify-between items-center p-4 border-b border-stone-200 bg-gradient-to-r from-amber-500 to-orange-500">
                    <div className="flex items-center">
                        <span className="text-2xl mr-2">🎸</span>
                        <span className="text-xl font-black text-white">GuitarStore</span>
                    </div>
                    <button onClick={() => setIsMenuOpen(false)} className="text-white">
                        <X className="w-7 h-7" />
                    </button>
                </div>

                {/* Mobile Search */}
                <div className="p-4 border-b border-stone-100">
                    <div className="flex h-11 border border-stone-200 rounded-xl overflow-hidden">
                        <input
                            type="search"
                            placeholder="Search guitars..."
                            className="flex-grow px-4 text-sm focus:outline-none"
                        />
                        <button className="px-4 bg-amber-500 text-white">
                            <Search className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="p-4 space-y-2 overflow-y-auto max-h-[calc(100vh-180px)]">
                    
                    {/* Categories */}
                    {categories.length > 0 && (
                        <>
                            <h3 className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-3 flex items-center">
                                <Music className="w-4 h-4 mr-2 text-amber-500" />
                                Categories
                            </h3>
                            {categories.map((category) => (
                                <Link
                                    key={category.id}
                                    to={`/shop?category=${encodeURIComponent(category.name.toUpperCase())}`}
                                    className="flex items-center px-4 py-3 text-base font-medium text-neutral-800 hover:bg-amber-50 hover:text-amber-600 rounded-xl border border-stone-100"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <span className="mr-3">🎸</span>
                                    {category.name}
                                </Link>
                            ))}
                            <hr className='border-stone-200 my-4' />
                        </>
                    )}

                    {/* Navigation Links */}
                    <h3 className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-3">
                        Menu
                    </h3>
                    {[...regularLinks, highlightLink].filter(Boolean).map((link, index) => (
                        <Link 
                            key={index} 
                            to={link.href} 
                            className={`flex items-center px-4 py-3 text-base font-medium rounded-xl ${
                                link.isHighlight 
                                    ? 'text-white bg-gradient-to-r from-red-500 to-orange-500 shadow-md' 
                                    : 'text-neutral-800 hover:bg-amber-50 hover:text-amber-600 border border-stone-100'
                            }`}
                            onClick={() => setIsMenuOpen(false)}
                        >
                            {link.title} 
                            {link.badge && (
                                <span className="ml-auto bg-white text-red-500 text-xs font-bold px-2 py-0.5 rounded-full">
                                    {link.badge}
                                </span>
                            )}
                        </Link>
                    ))}
                    
                    <hr className='border-stone-200 my-4' />

                    {/* Account Section */}
                    {isAuthenticated ? (
                        <div className="space-y-2">
                            <div className="flex items-center px-4 py-3 bg-amber-50 rounded-xl">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold mr-3">
                                    {initials}
                                </div>
                                <div>
                                    <p className="font-semibold text-neutral-800">{userDisplayName}</p>
                                    <p className="text-xs text-stone-500">Welcome back!</p>
                                </div>
                            </div>
                            
                            <Link 
                                to="/orders" 
                                className="flex items-center px-4 py-3 text-base font-medium text-neutral-800 hover:bg-amber-50 rounded-xl border border-stone-100"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <Package className="w-5 h-5 mr-3 text-amber-500" />
                                My Orders
                            </Link>

                            {isAdmin && (
                                <Link 
                                    to="/admin" 
                                    className="flex items-center px-4 py-3 text-base font-medium text-amber-600 bg-amber-50 rounded-xl border border-amber-200"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <span className="mr-3">⚙️</span>
                                    Admin Dashboard
                                </Link>
                            )}

                            <button 
                                onClick={() => { handleLogoutAndRedirect(); setIsMenuOpen(false); }} 
                                className="w-full flex items-center justify-center px-4 py-3 text-base font-semibold text-red-600 bg-red-50 rounded-xl border border-red-200"
                            >
                                Log Out
                            </button>
                        </div>
                    ) : (
                        <Link 
                            to="/login" 
                            className="flex items-center justify-center px-4 py-3 text-base font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-md"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            <User className="w-5 h-5 mr-2" />
                            Sign In / Register
                        </Link>
                    )}
                </div>
            </div>
        </>
    );
}   