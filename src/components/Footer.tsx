import React, { useState } from 'react';
import { Package, Send, Heart, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && email.includes('@')) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="bg-gray-950 text-gray-400 font-sans border-t border-gray-900">
      
      {/* Upper newsletter call to action strip */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 border-b border-gray-900">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center text-right">
          <div>
            <h3 className="text-lg font-black text-white">اشترك في قائمتنا البريدية المميّزة</h3>
            <p className="text-xs text-gray-500 mt-1">كن أول من يعلم عن تشكيلات الموسم الجديدة، العروض والخصومات الفورية الفاخرة.</p>
          </div>
          
          <form onSubmit={handleSubscribe} className="relative max-w-md w-full md:mr-auto">
            <div className="relative">
              <input
                type="email"
                placeholder="أدخل عنوان بريدك الإلكتروني..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-full border border-gray-900 bg-gray-900/50 py-3.5 pr-4 pl-14 text-xs text-white placeholder:text-gray-600 outline-none focus:border-indigo-600 focus:bg-gray-900 direction-rtl"
                id="newsletter-email-input"
              />
              <button
                type="submit"
                className="absolute left-1 top-1 flex h-9 items-center justify-center rounded-full bg-white px-4 text-xs font-bold text-gray-950 hover:bg-indigo-600 hover:text-white transition-all outline-none"
                id="newsletter-subscribe-btn"
              >
                {subscribed ? 'تم الاشتراك!' : 'اشترك'}
              </button>
            </div>
            {subscribed && (
              <p className="text-[11px] font-semibold text-emerald-400 mt-2 text-right">
                ✓ تم تسجيل بريدك بنجاح! شكراً لانضمامك إلينا.
              </p>
            )}
          </form>
        </div>
      </div>

      {/* Main navigation links body */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12 text-right">
        
        {/* Unit 1: About Boutique */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 justify-end">
            <div>
              <span className="block font-sans text-lg font-black tracking-tight text-white">
                AURA
              </span>
              <span className="block font-mono text-[9px] font-semibold uppercase tracking-wider text-gray-600 -mt-1 text-right">
                Boutique
              </span>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-900 text-white">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <p className="text-xs leading-relaxed text-gray-500 font-light">
            وجهة التسوق العالمية الأولى التي توفر تصاميم راقية بجودة استثنائية ملائمة لأسلوب حياتك العصري الفاخر. نحن فخورون بثقة عملائنا حول العالم.
          </p>
        </div>

        {/* Unit 2: Shopping Categories links */}
        <div className="space-y-4">
          <h4 className="text-xs font-black uppercase tracking-wider text-white">أقسام التسوق الرئيسية</h4>
          <ul className="space-y-2.5 text-xs text-gray-500 font-semibold">
            <li><a href="#featured-grid-anchor" className="hover:text-white transition-colors">جميع تصاميم المتجر</a></li>
            <li><a href="#featured-grid-anchor" className="hover:text-white transition-colors">الملبوسات والسترات الفاخرة</a></li>
            <li><a href="#featured-grid-anchor" className="hover:text-white transition-colors">الحُلِيّ والمجوهرات الذهبية</a></li>
            <li><a href="#featured-grid-anchor" className="hover:text-white transition-colors">الأجهزة الذكية والإلكترونيات</a></li>
          </ul>
        </div>

        {/* Unit 3: Help and policy links */}
        <div className="space-y-4">
          <h4 className="text-xs font-black uppercase tracking-wider text-white">روابط تهم العميل</h4>
          <ul className="space-y-2.5 text-xs text-gray-500 font-semibold">
            <li><a href="#featured-grid-anchor" className="hover:text-white transition-colors">الأسئلة الشائعة للعملاء</a></li>
            <li><a href="#featured-grid-anchor" className="hover:text-white transition-colors">سياسة الشحن ومصاريف الطرود</a></li>
            <li><a href="#featured-grid-anchor" className="hover:text-white transition-colors">سياسة الاسترجاع الميسرة</a></li>
            <li><a href="#featured-grid-anchor" className="hover:text-white transition-colors">تتبع حالة طلباتك الحالية</a></li>
          </ul>
        </div>

        {/* Unit 4: Support Contact info */}
        <div className="space-y-4">
          <h4 className="text-xs font-black uppercase tracking-wider text-white">تواصل معنا المباشر</h4>
          <ul className="space-y-3 text-xs text-gray-500 font-semibold">
            <li className="flex items-center gap-2 justify-end">
              <span>support@auraboutique.com</span>
              <Mail className="h-4 w-4 text-gray-700" />
            </li>
            <li className="flex items-center gap-2 justify-end">
              <span>+966 800 124 5555</span>
              <Phone className="h-4 w-4 text-gray-700" />
            </li>
            <li className="flex items-center gap-2 justify-end">
              <span>شارع العليا العام، الرياض، المملكة العربية السعودية</span>
              <MapPin className="h-4 w-4 text-gray-700" />
            </li>
          </ul>
        </div>

      </div>

      {/* Bottom copy strip and credit lines */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 border-t border-gray-900/50 flex flex-col md:flex-row items-center justify-between text-xs text-gray-600">
        <div className="order-2 md:order-1 mt-4 md:mt-0 flex items-center gap-1">
          <span>صُمم بالكامل بشغف كبير</span>
          <Heart className="h-3 w-3 text-rose-500 fill-rose-500" />
          <span>في متجر أورا الفاخر</span>
        </div>
        <p className="order-1 md:order-2 text-right">
          جميع الحقوق محفوظة لمتجر أورا بوتيك © {new Date().getFullYear()} م
        </p>
      </div>

    </footer>
  );
}
