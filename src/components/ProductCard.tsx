import React, { useState } from 'react';
import { ShoppingCart, Star, Eye, Check } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
  key?: React.Key;
}

export default function ProductCard({ product, onQuickView }: ProductCardProps) {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAdding(true);
    addToCart(product, 1);
    setTimeout(() => {
      setIsAdding(false);
    }, 1000);
  };

  const isLowStock = product.stock <= 5;
  const isBestSeller = product.rating.rate >= 4.7;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-2xl hover:border-indigo-100"
    >
      {/* Product Image Area */}
      <div className="relative aspect-square w-full overflow-hidden bg-gray-50">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-106"
          referrerPolicy="no-referrer"
        />

        {/* Floating Badges */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5">
          {isBestSeller && (
            <span className="rounded-full bg-amber-500 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm">
              الأعلى تقييماً ★
            </span>
          )}
          {isLowStock && (
            <span className="rounded-full bg-rose-500 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm animate-pulse">
              كمية محدودة جداً
            </span>
          )}
        </div>

        {/* Overlay Action Buttons - Shows on hover */}
        <div className="absolute inset-0 flex items-center justify-center bg-gray-950/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <button
            onClick={() => onQuickView(product)}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-gray-900 shadow-xl transition-transform hover:scale-110 hover:bg-gray-900 hover:text-white"
            title="نظرة سريعة"
            id={`quick-view-btn-${product.id}`}
          >
            <Eye className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Product Information Body */}
      <div className="flex flex-1 flex-col p-4.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 mb-1 text-right">
          {product.category}
        </span>
        
        <h3 className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1 text-right min-h-[20px]">
          {product.name}
        </h3>

        {/* Star Rating Panel */}
        <div className="mt-2 flex items-center gap-1.5 justify-end">
          <span className="text-xs text-gray-400">({product.rating.count})</span>
          <span className="text-xs font-bold text-gray-700">{product.rating.rate}</span>
          <div className="flex text-amber-500">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i < Math.round(product.rating.rate) ? 'fill-amber-500' : 'text-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Price & Add to Cart footer */}
        <div className="mt-5 flex items-center justify-between border-t border-gray-50 pt-3">
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`flex h-9 items-center justify-center gap-2 rounded-xl px-3 text-xs font-bold transition-all outline-none ${
              product.stock === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : isAdding
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-50 text-gray-900 hover:bg-indigo-600 hover:text-white'
            }`}
            id={`add-to-cart-${product.id}`}
          >
            {isAdding ? (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>تم الإضافة</span>
              </>
            ) : product.stock === 0 ? (
              <span>نفذت الكمية</span>
            ) : (
              <>
                <ShoppingCart className="h-3.5 w-3.5" />
                <span>أضف للسلة</span>
              </>
            )}
          </button>

          <div className="text-right">
            <span className="block text-[9px] uppercase tracking-wider text-gray-400">السعر</span>
            <span className="text-sm font-black text-gray-950 font-mono">${product.price.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
