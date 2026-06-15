import React, { useState, useMemo, useEffect } from 'react';
import { Filter, SlidersHorizontal, ArrowUpDown, ChevronDown } from 'lucide-react';
import { PRODUCTS, CATEGORIES } from '../data/products';
import { Product } from '../types';
import ProductCard from './ProductCard';
import { getProductsFromDB } from '../lib/db';

interface ProductGridProps {
  onQuickView: (product: Product) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'rating';

export default function ProductGrid({
  onQuickView,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
}: ProductGridProps) {
  const [productsList, setProductsList] = useState<Product[]>(PRODUCTS);
  const [sortBy, setSortBy] = useState<SortOption>('default');

  // Load live products from Firestore database
  useEffect(() => {
    getProductsFromDB()
      .then((dbProducts) => {
        if (dbProducts && dbProducts.length > 0) {
          setProductsList(dbProducts);
        }
      })
      .catch((err) => {
        console.error("Error loading live boutique catalog, using offline assets:", err);
      });
  }, []);

  // Filter & Sort Logic combined dynamically
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...productsList];

    // 1. Category Filter
    if (selectedCategory !== 'All') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // 2. Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    // 3. Sort Logic
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating.rate - a.rating.rate);
    }

    return result;
  }, [selectedCategory, searchQuery, sortBy]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8" id="featured-grid-anchor">
      
      {/* Visual Section Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between border-b border-gray-100 pb-8 mb-10">
        <div className="order-2 md:order-1 mt-4 md:mt-0 flex gap-4 justify-center md:justify-start">
          {/* Custom sorting dropdown */}
          <div className="relative inline-flex items-center gap-1.5 rounded-xl border border-gray-100 bg-gray-50/50 px-3 py-1.5">
            <ArrowUpDown className="h-4 w-4 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="text-xs font-semibold text-gray-700 bg-transparent outline-none cursor-pointer pr-1"
              id="grid-sort-select"
            >
              <option value="default">الترتيب الافتراضي</option>
              <option value="price-asc">السعر: من الأقل للأعلى</option>
              <option value="price-desc">السعر: من الأعلى للأقل</option>
              <option value="rating">حسب التقييم</option>
            </select>
          </div>
        </div>

        <div className="order-1 md:order-2 text-center md:text-right">
          <h2 className="text-2xl font-black text-gray-950 sm:text-3xl tracking-tight">
            تسوّق منتجاتنا المميزة
          </h2>
          <p className="text-xs text-gray-400 mt-1 max-w-md">
            تصاميم حديثة ومختارة بعناية تجمع بين الأناقة المطلقة والتكنولوجيا المتطورة.
          </p>
        </div>
      </div>

      {/* Categories Desktop bar */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-12 lg:justify-end">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-full px-5 py-2.5 text-xs font-bold transition-all duration-200 cursor-pointer outline-none ${
              selectedCategory === cat
                ? 'bg-gray-950 text-white shadow-md'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
            id={`category-tab-${cat.replace(/\s+/g, '-').toLowerCase()}`}
          >
            {cat === 'All' ? 'جميع المنتجات' : cat}
          </button>
        ))}
      </div>

      {/* Grid Display Area */}
      {filteredAndSortedProducts.length > 0 ? (
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {filteredAndSortedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={onQuickView}
            />
          ))}
        </div>
      ) : (
        /* Dynamic elegant empty state container */
        <div className="py-20 text-center bg-gray-50/50 rounded-3xl border border-dashed border-gray-200 max-w-lg mx-auto">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-400 mb-4">
            <Filter className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-gray-800">لم نجد أي نتائج متطابقة</h3>
          <p className="text-xs text-gray-400 mt-1 px-8">
            يرجى التحقق من صياغة البحث أو اختيار فصول تصفية أخرى لاستعراض منتجات أورا.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
              setSortBy('default');
            }}
            className="mt-6 rounded-full bg-gray-900 px-5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-600 transition-all outline-none"
            id="reset-filters-btn"
          >
            استعادة كافة المنتجات
          </button>
        </div>
      )}
    </section>
  );
}
