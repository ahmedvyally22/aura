import React, { useState, useEffect } from 'react';
import { X, Star, ShoppingCart, Check, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'motion/react';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

export default function ProductModal({ product, onClose }: ProductModalProps) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  // Reset quantity when modal opens for a new product
  useEffect(() => {
    if (product) {
      setQuantity(1);
    }
  }, [product]);

  // Handle escape key listener
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!product) return null;

  const handleAddToCart = () => {
    setIsAdding(true);
    addToCart(product, quantity);
    setTimeout(() => {
      setIsAdding(false);
      onClose();
    }, 1000);
  };

  const isLowStock = product.stock <= 5;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-gray-950/40 backdrop-blur-sm"
        />

        {/* Modal content body */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="relative w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-gray-100 flex flex-col md:flex-row max-h-[90vh]"
          id="product-quick-view-modal"
        >
          {/* Close button top right */}
          <button
            onClick={onClose}
            className="absolute left-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-md text-gray-700 shadow-md transition-all hover:bg-gray-950 hover:text-white"
            id="modal-close-btn"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Left panel: Large item design image */}
          <div className="relative w-full md:w-1/2 bg-gray-50 h-64 md:h-auto min-h-[300px]">
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
            {isLowStock && (
              <span className="absolute bottom-4 right-4 rounded-xl bg-rose-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
                كمية محدودة! {product.stock} قطع متبقية فقط
              </span>
            )}
          </div>

          {/* Right panel: Details and purchase action parameters */}
          <div className="flex-1 p-6 md:p-8 overflow-y-auto text-right flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                {product.category}
              </span>
              
              <h2 className="text-xl md:text-2xl font-black text-gray-950 mt-1 leading-snug">
                {product.name}
              </h2>

              {/* Star Rating Panel */}
              <div className="mt-3 flex items-center gap-1.5 justify-end">
                <span className="text-xs text-gray-400">({product.rating.count} تقييم حقيقي للعملاء)</span>
                <span className="text-sm font-bold text-gray-700">{product.rating.rate} من 5</span>
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4.5 w-4.5 ${
                        i < Math.round(product.rating.rate) ? 'fill-amber-500' : 'text-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Pricing section */}
              <div className="mt-5 border-y border-gray-50 py-3.5 flex items-center justify-between">
                <span className="text-2xl font-black text-indigo-600 font-mono">${product.price.toFixed(2)}</span>
                <span className="text-xs font-semibold text-gray-400">سعر الوحدة شامل الضريبة</span>
              </div>

              {/* Description */}
              <div className="mt-5">
                <h4 className="text-xs font-bold text-gray-400 uppercase">عن المنتج والفوائد</h4>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed font-sans">{product.description}</p>
              </div>

              {/* Quality Assurances */}
              <div className="mt-6 grid grid-cols-3 gap-2 border-t border-gray-50 pt-5 text-center">
                <div className="p-2.5 rounded-2xl bg-gray-50/50">
                  <ShieldCheck className="h-5 w-5 text-indigo-600 mx-auto mb-1" />
                  <p className="text-[10px] font-bold text-gray-800">أصلي 100%</p>
                </div>
                <div className="p-2.5 rounded-2xl bg-gray-50/50">
                  <Truck className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
                  <p className="text-[10px] font-bold text-gray-800">شحن آمن</p>
                </div>
                <div className="p-2.5 rounded-2xl bg-gray-50/50">
                  <RefreshCw className="h-5 w-5 text-amber-500 mx-auto mb-1" />
                  <p className="text-[10px] font-bold text-gray-800">إرجاع ميسر</p>
                </div>
              </div>
            </div>

            {/* Quantity select inputs and core click handle CTA */}
            <div className="mt-8 border-t border-gray-100 pt-5 flex items-center gap-4 justify-between">
              {/* Purchase Trigger */}
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`flex-1 flex h-12 items-center justify-center gap-2 rounded-2xl px-6 text-sm font-bold transition-all outline-none ${
                  product.stock === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : isAdding
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-950 text-white hover:bg-indigo-600 hover:scale-102 shadow-lg shadow-gray-950/10'
                }`}
                id="modal-add-to-cart-trigger"
              >
                {isAdding ? (
                  <>
                    <Check className="h-4.5 w-4.5" />
                    <span>تمت الإضافة بنجاح</span>
                  </>
                ) : product.stock === 0 ? (
                  <span>نفذ من المخزون</span>
                ) : (
                  <>
                    <ShoppingCart className="h-4.5 w-4.5" />
                    <span>أضف إلى عربة التسوق</span>
                  </>
                )}
              </button>

              {/* Quantity selector */}
              {product.stock > 0 && (
                <div className="flex items-center rounded-2xl border border-gray-200 bg-gray-50 p-1.5 h-12">
                  <button
                    onClick={() => setQuantity(q => Math.min(q + 1, product.stock))}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-gray-700 shadow-sm transition-colors hover:bg-gray-950 hover:text-white"
                    disabled={quantity >= product.stock}
                  >
                    +
                  </button>
                  <span className="w-10 text-center text-sm font-bold font-mono">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.max(q - 1, 1))}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-gray-700 shadow-sm transition-colors hover:bg-gray-950 hover:text-white"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                </div>
              )}
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
