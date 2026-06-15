import React, { useState, useEffect } from 'react';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductGrid from './components/ProductGrid';
import ProductModal from './components/ProductModal';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import Footer from './components/Footer';
import AIChatbot from './components/AIChatbot';
import AdminDashboard from './components/AdminDashboard';
import { Product } from './types';

function MainAppLayout() {
  const [view, setView] = useState<'shop' | 'admin'>('shop');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  
  // Search and filter States matching Navbar & product grid together
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const { user } = useAuth();

  useEffect(() => {
    const isUrlAdminPanel = window.location.pathname === '/admin-panel';
    const urlParams = new URLSearchParams(window.location.search);
    const hasAccessAdmin = urlParams.get('access') === 'admin';
    
    if (isUrlAdminPanel || hasAccessAdmin) {
      setView('admin');
    }
  }, [user]);

  const scrollToBrowseGrid = () => {
    const el = document.getElementById('featured-grid-anchor');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  if (view === 'admin') {
    return (
      <AdminDashboard
        onClose={() => {
          if (window.location.pathname === '/admin-panel') {
            window.history.replaceState({}, document.title, '/');
          }
          setView('shop');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* 1. Sticky Navigation Bar */}
      <Navbar
        onCartClick={() => setIsCartOpen(true)}
        onProductClick={(product) => setSelectedProduct(product)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        onAdminClick={() => setView('admin')}
      />

      {/* 2. Visual Hero section with seamless anchor scrolling */}
      <Hero onExploreClick={scrollToBrowseGrid} />

      {/* 3. Products Browser main feed with filter logic */}
      <main className="flex-1">
        <ProductGrid
          onQuickView={(product) => setSelectedProduct(product)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
      </main>

      {/* 4. Footers site map */}
      <Footer />

      {/* 5. Quick-View overlay modal dialog */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      {/* 6. Dynamic slide sliding Cart Drawer drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* 7. Comprehensive interactive simulated checkout portal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />

      {/* 8. AI shopping chatbot virtual advisor */}
      <AIChatbot />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainAppLayout />
      </CartProvider>
    </AuthProvider>
  );
}
