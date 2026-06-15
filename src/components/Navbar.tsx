import React, { useState, useRef, useEffect } from 'react';
import { ShoppingBag, Search, Menu, X, Package, Trash2, Heart, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { PRODUCTS } from '../data/products';
import { Product } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';

interface NavbarProps {
  onCartClick: () => void;
  onProductClick: (product: Product) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  onAdminClick?: () => void;
}

export default function Navbar({
  onCartClick,
  onProductClick,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  onAdminClick,
}: NavbarProps) {
  const { cartCount, cartTotal } = useCart();
  const { user, logout, getInitials } = useAuth();
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search suggestions on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const suggestions = searchQuery.trim()
    ? PRODUCTS.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-100 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo Section */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
            }}
            className="flex items-center gap-2.5 outline-none group text-left"
            id="nav-logo-btn"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900 text-white transition-all group-hover:scale-105 group-hover:bg-indigo-600">
              <Package className="h-5.5 w-5.5" />
            </div>
            <div>
              <span className="block font-sans text-lg font-bold tracking-tight text-gray-950">
                AURA
              </span>
              <span className="block font-mono text-[9px] font-semibold uppercase tracking-wider text-gray-400 -mt-1">
                Boutique
              </span>
            </div>
          </button>
        </div>

        {/* Search Bar - Center with instant action suggestions */}
        <div ref={searchRef} className="relative hidden max-w-md flex-1 px-8 md:block">
          <div className="relative">
            <input
              type="text"
              placeholder="ابحث عن منتجات، ماركات، أقسام..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchSuggestions(true);
              }}
              onFocus={() => setShowSearchSuggestions(true)}
              className="w-full rounded-full border border-gray-200 bg-gray-50 py-2.5 pr-4 pl-10 text-sm outline-none transition-all placeholder:text-gray-400 focus:border-gray-900 focus:bg-white focus:ring-1 focus:ring-gray-900 direction-rtl"
              id="desktop-search-input"
            />
            <Search className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-gray-400" />
          </div>

          {/* Premium suggestions overlay */}
          <AnimatePresence>
            {showSearchSuggestions && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.15 }}
                className="absolute right-8 left-8 mt-2 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl"
              >
                <div className="p-2 border-b border-gray-50 bg-gray-50/50 px-4 py-1.5 flex justify-between items-center">
                  <span className="text-[11px] font-semibold text-gray-400 tracking-wider uppercase">مثبتات البحث الأقرب</span>
                  <span className="text-[10px] text-gray-400">نتائج فورية</span>
                </div>
                <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
                  {suggestions.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => {
                        onProductClick(product);
                        setShowSearchSuggestions(false);
                        setSearchQuery('');
                      }}
                      className="flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-gray-50"
                      id={`suggestion-item-${product.id}`}
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-10 w-10 rounded-lg object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-xs font-semibold text-gray-800 line-clamp-1 text-right">{product.name}</p>
                        <p className="text-[10px] text-gray-400 text-right">{product.category}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-gray-950 font-mono">${product.price.toFixed(2)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Corner Buttons */}
        <div className="flex items-center gap-4">
          
          {/* Authentication System Profile Trigger */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="block text-[9px] font-bold uppercase tracking-wider text-gray-400">مرحباً</span>
                  <span className="block text-xs font-black text-gray-900 truncate max-w-[120px]">{user.displayName || user.email}</span>
                </div>
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User Profile'}
                    className="h-9 w-9 rounded-full object-cover border border-gray-150 shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-xs ring-2 ring-indigo-50 shadow-md">
                    {getInitials()}
                  </div>
                )}
                {user && (user.email === 'ahmedvyally22@gmail.com' || user.email === 'admin@aura.com') && onAdminClick && (
                  <button
                    onClick={onAdminClick}
                    className="rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 px-3 py-1.5 text-[10px] font-black tracking-tight shadow-sm transition-colors cursor-pointer"
                    id="navbar-admin-board-btn"
                  >
                    لوحة التحكم
                  </button>
                )}
                <button
                  onClick={logout}
                  className="rounded-xl border border-gray-150 bg-gray-50 px-3 py-1.5 text-[10px] font-black hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                  id="navbar-logout-btn"
                >
                   خروج
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-gray-950 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-600 transition-colors cursor-pointer shadow-sm"
                id="navbar-login-btn"
              >
                <User className="h-3.5 w-3.5" />
                <span>دخول / تسجيل</span>
              </button>
            )}
          </div>

          {/* Basket Cart Count Trigger */}
          <button
            onClick={onCartClick}
            className="group relative flex h-10 items-center gap-2 rounded-full border border-gray-100 bg-gray-50/50 px-3.5 py-1.5 transition-all hover:border-gray-900/15 hover:bg-white focus:outline-none"
            id="navbar-cart-btn"
          >
            <div className="relative">
              <ShoppingBag className="h-5 w-5 text-gray-950 transition-transform group-hover:scale-105" />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1.5 -right-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white shadow-md ring-2 ring-white"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            <div className="hidden text-right text-xs font-medium md:block">
              <span className="block text-[9px] uppercase tracking-wider text-gray-400 -mb-0.5">سلتك</span>
              <span className="block font-semibold text-gray-950 font-mono">${cartTotal.toFixed(2)}</span>
            </div>
          </button>

          {/* Mobile Search & Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-700 hover:bg-gray-100 md:hidden"
            id="mobile-menu-btn"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Slide-down Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-100 bg-white md:hidden overflow-hidden"
          >
            <div className="space-y-4 px-4 py-6">
              {/* Search on Mobile */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="ابحث هنا..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pr-4 pl-10 text-sm outline-none focus:border-indigo-600 focus:bg-white direction-rtl"
                  id="mobile-search-input"
                />
                <Search className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-gray-400" />
              </div>

              {/* Suggestions on Mobile */}
              {searchQuery.trim() && (
                <div className="rounded-xl border border-gray-50 bg-gray-50/50 p-2 space-y-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase px-2">اقتراحات البحث</p>
                  {PRODUCTS.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3).map(product => (
                    <button
                      key={product.id}
                      onClick={() => {
                        onProductClick(product);
                        setMobileMenuOpen(false);
                        setSearchQuery('');
                      }}
                      className="flex w-full items-center gap-3 rounded-lg p-2 transition-colors hover:bg-white text-right"
                    >
                      <img src={product.image} alt={product.name} className="h-8 w-8 rounded object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800 truncate">{product.name}</p>
                        <p className="text-[9px] text-gray-400">${product.price.toFixed(2)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Mobile Category Links */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2 px-1 text-right">الفئات والأقسام</p>
                <div className="grid grid-cols-2 gap-2">
                  {['All', 'Electronics', 'Fashion & Apparel', 'Accessories & Jewelry', 'Home & Living'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setMobileMenuOpen(false);
                      }}
                      className={`rounded-xl py-2 px-3 text-sm font-semibold transition-all text-center ${
                        (selectedCategory === cat)
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {cat === 'All' ? 'المتجر بالكامل' : cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Auth Menu options */}
              <div className="border-t border-gray-100/60 pt-4 px-1">
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3 bg-gray-50 rounded-xl p-3">
                      <div className="flex items-center gap-3">
                        {user.photoURL ? (
                          <img
                            src={user.photoURL}
                            alt={user.displayName || 'User Profile'}
                            className="h-10 w-10 rounded-full object-cover border border-gray-200"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-sm shadow-md">
                            {getInitials()}
                          </div>
                        )}
                        <div className="text-right">
                          <p className="text-xs font-bold text-gray-900">{user.displayName || 'مستشار أورا'}</p>
                          <p className="text-[10px] text-gray-400 font-mono truncate max-w-[140px]">{user.email}</p>
                        </div>
                      </div>
                      <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[9px] font-black text-indigo-600">عضوية ذهبية</span>
                    </div>
                    {user && (user.email === 'ahmedvyally22@gmail.com' || user.email === 'admin@aura.com') && onAdminClick && (
                      <button
                        onClick={() => {
                          onAdminClick();
                          setMobileMenuOpen(false);
                        }}
                        className="w-full rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 py-2.5 text-xs font-bold text-center transition-colors cursor-pointer"
                        id="mobile-admin-board-btn"
                      >
                        لوحة التحكم والتحليلات
                      </button>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full rounded-xl bg-rose-50 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-100 transition-colors"
                      id="mobile-logout-btn"
                    >
                      تسجيل الخروج من الحساب
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setIsAuthOpen(true);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full rounded-xl bg-gray-950 py-2.5 text-xs font-bold text-white hover:bg-indigo-600 transition-colors flex items-center justify-center gap-1.5"
                    id="mobile-login-btn"
                  >
                    <User className="h-4 w-4" />
                    <span>تسجيل الدخول / إنشاء حساب</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth Control overlay popup popup dialog */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </header>
  );
}
