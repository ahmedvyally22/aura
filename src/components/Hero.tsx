import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';

interface HeroProps {
  onExploreClick: () => void;
}

export default function Hero({ onExploreClick }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-radial from-gray-50 to-white py-16 sm:py-24">
      {/* Visual background decoration */}
      <div className="absolute top-0 right-0 -mr-64 h-[600px] w-[600px] rounded-full bg-indigo-50/40 blur-3xl" />
      <div className="absolute bottom-0 left-0 -ml-64 h-[500px] w-[500px] rounded-full bg-violet-50/50 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
          
          {/* Left Visual Banner Image - Loaded using high res placeholder with parallax hover */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="lg:col-span-5 relative"
          >
            <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-3 shadow-3xl">
              <div className="relative h-96 w-full overflow-hidden rounded-2xl sm:h-[480px]">
                <img
                  src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=800"
                  alt="Elegant Showcase Collection"
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                
                {/* Floating Micro tags */}
                <div className="absolute top-4 right-4 rounded-xl bg-white/95 backdrop-blur-md px-3 py-1.5 shadow-md flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
                  <span className="text-xs font-bold text-gray-950">تشكيلة جديدة</span>
                </div>

                <div className="absolute bottom-4 left-4 rounded-xl bg-gray-950/95 backdrop-blur-md p-3.5 text-white shadow-xl max-w-xs">
                  <p className="text-[10px] uppercase font-mono tracking-wider text-indigo-400">العرض الأكثر مبيعاً</p>
                  <p className="text-sm font-bold mt-1">تخفيضات تصل إلى 35% على الإكسسوارات الذهبية</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Text Content (Design with generous margins and premium typography) */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            className="lg:col-span-7 space-y-8 text-center lg:text-right"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50/80 px-4 py-1.5 text-indigo-700">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              <span className="text-xs font-bold tracking-wide">متجر أورا بوتيك - تجربة تسوق عالمية مميزة</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-gray-950 sm:text-5xl md:text-6xl leading-tight">
              تصاميم تعكس <span className="bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-amber-500 bg-clip-text text-transparent">تفردك</span> وأسلوبك الفاخر
            </h1>

            <p className="mx-auto max-w-2xl text-base text-gray-600 md:text-lg leading-relaxed lg:mx-0">
              اكتشف عالم الموضة الراقية، الإلكترونيات الذكية، ومستلزمات المعيشة المصممة بعناية فائقة لتلائم ذوقك العصري الفريد. نحن نقدم لعملائنا في جميع أنحاء العالم جودة استثنائية وتصاميم متفردة.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                onClick={onExploreClick}
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-gray-950 px-8 py-4 text-sm font-bold text-white shadow-lg transition-all hover:bg-indigo-600 hover:shadow-indigo-100 hover:scale-102 focus:outline-none"
                id="hero-cta-explore"
              >
                تسوّق الآن
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              
              <button
                onClick={() => {
                  const el = document.getElementById('featured-grid-anchor');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-8 py-4 text-sm font-semibold text-gray-800 transition-all hover:border-gray-950 hover:bg-gray-50 focus:outline-none"
                id="hero-cta-catalog"
              >
                أحدث المنتجات
              </button>
            </div>

            {/* Features strip cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-3 justify-center lg:justify-start">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Truck className="h-5 w-5" />
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-900">شحن مجاني وسريع</p>
                  <p className="text-[10px] text-gray-400">للطلبات فوق 100$</p>
                </div>
              </div>

              <div className="flex items-center gap-3 justify-center lg:justify-start">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-900">دفع آمن بالكامل</p>
                  <p className="text-[10px] text-gray-400">تشفير وحماية عالية</p>
                </div>
              </div>

              <div className="flex items-center gap-3 justify-center lg:justify-start">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <RotateCcw className="h-5 w-5" />
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-900">استرجاع سهل خلال 30 يوم</p>
                  <p className="text-[10px] text-gray-400">ضمان استعادة الأموال</p>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
