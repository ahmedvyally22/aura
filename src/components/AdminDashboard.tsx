import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  getOrdersFromDB, 
  getProductsFromDB, 
  addProductToDB, 
  deleteProductFromDB, 
  OrderData 
} from '../lib/db';
import { Product } from '../types';
import { 
  ArrowRight, 
  Sparkles, 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  DollarSign, 
  FileText,
  Lock,
  Loader2,
  LayoutDashboard,
  Package,
  PlusCircle,
  Plus,
  Trash2,
  Globe,
  Image as ImageIcon
} from 'lucide-react';
import { motion } from 'motion/react';
import Markdown from 'react-markdown';

interface AdminDashboardProps {
  onClose: () => void;
}

type TabType = 'overview' | 'products' | 'add-product' | 'orders';

export default function AdminDashboard({ onClose }: AdminDashboardProps) {
  const { user } = useAuth();
  
  // Tab control
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  
  // Database states
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Deletion tracking
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  // Add product form states
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodCategory, setProdCategory] = useState('Electronics');
  const [prodImage, setProdImage] = useState('');
  const [prodStock, setProdStock] = useState('10');
  const [prodFeatured, setProdFeatured] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // AI analysis state
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Quick Stats
  const [stats, setStats] = useState({
    totalSales: 0,
    ordersCount: 0,
    uniqueUsersCount: 0,
  });

  // Verify Admin privilege
  const isAdmin = user && (user.email === 'ahmedvyally22@gmail.com' || user.email === 'admin@aura.com');

  // Client-side image compression utility to fit in Firestore 1MB document size limit
  const compressImage = (base64Str: string, maxWidth = 800, maxHeight = 800, quality = 0.75): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', quality);
          resolve(compressed);
        } else {
          resolve(base64Str);
        }
      };
      img.onerror = () => {
        resolve(base64Str);
      };
    });
  };

  useEffect(() => {
    if (isAdmin) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch live products from DB (does not require auth)
      try {
        const fetchedProducts = await getProductsFromDB();
        setProducts(fetchedProducts || []);
      } catch (prodErr: any) {
        console.error("Dashboard products list loading error:", prodErr);
        setError("حدث خطأ أثناء تحميل قائمة المنتجات من قاعدة البيانات.");
      }

      // 2. Fetch orders from DB (requires auth, so we fail gracefully for bypass access)
      try {
        const fetchedOrders = await getOrdersFromDB();
        setOrders(fetchedOrders || []);

        // Analyze statistics
        const totalSales = (fetchedOrders || []).reduce((sum, order) => sum + order.total, 0);
        const uniqueEmails = new Set((fetchedOrders || []).map(order => order.userEmail).filter(Boolean));
        
        setStats({
          totalSales,
          ordersCount: (fetchedOrders || []).length,
          uniqueUsersCount: uniqueEmails.size || 1,
        });
      } catch (ordErr: any) {
        console.error("Dashboard orders loading error:", ordErr);
        // Do not block products loading if orders fetch fails (e.g. mock/bypass unauthenticated access)
      }
    } catch (err: any) {
      console.error("Dashboard listing error:", err);
      setError("حدث خطأ غير متوقع أثناء معالجة بيانات لوحة التحكم.");
    } finally {
      setLoading(false);
    }
  };

  // Call server-side Gemini API for business analysis report
  const handleAIAnalysis = async () => {
    setGeneratingReport(true);
    setAiError(null);
    setAiReport(null);
    try {
      const response = await fetch('/api/admin/ai-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orders,
          products,
          stats: {
            totalSales: stats.totalSales,
            ordersCount: stats.ordersCount,
          }
        }),
      });

      if (!response.ok) {
        throw new Error('فشلت عملية إنشاء التحليل من خادم الذكاء الاصطناعي.');
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setAiReport(data.report);
    } catch (err: any) {
      console.error("AI Analysis report generation failed:", err);
      setAiError(err.message || "حدث خطأ غير متوقع أثناء استشارة مستشار الأعمال الذكي.");
    } finally {
      setGeneratingReport(false);
    }
  };

  // Delete product immediately from DB and update state
  const handleDeleteProduct = async (productId: number, productName: string) => {
    if (!window.confirm(`هل أنت متأكد من رغبتك في حذف المنتج "${productName}" نهائياً من قاعدة البيانات؟`)) {
      return;
    }
    
    setIsDeleting(productId);
    try {
      await deleteProductFromDB(productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
      setSuccessMessage(`تم حذف منتج "${productName}" بنجاح من الـ Firestore.`);
      
      // Update stats based on stock removal if helpful, or just let catalog count adapt
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error("Deletion error:", err);
      alert("عذراً، تعذرت عملية مسح المنتج. يرجى التحقق من صلاحيات المشرف وقواعد أمان Firestore الحالية.");
    } finally {
      setIsDeleting(null);
    }
  };

  // Add product form submit
  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    if (!prodName || !prodPrice || !prodCategory || !prodImage) {
      setFormError('يرجى تعبئة كافة الحقول الإلزامية المطلوبة.');
      return;
    }

    const priceNum = parseFloat(prodPrice);
    if (isNaN(priceNum) || priceNum < 0) {
      setFormError('قيمة السعر يجب أن تكون رقماً صالحاً ومجداً.');
      return;
    }

    const stockNum = parseInt(prodStock);
    if (isNaN(stockNum) || stockNum < 0) {
      setFormError('قيمة المخزون يجب أن تكون رقماً صحيحاً صِفراً أو أكبر.');
      return;
    }

    setSavingProduct(true);
    try {
      // Calculate max numerical id + 1 to keep order clean
      const maxId = products.length > 0 ? Math.max(...products.map(p => p.id)) : 100;
      const nextId = maxId + 1;

      const newProduct: Product = {
        id: nextId,
        name: prodName,
        price: priceNum,
        description: prodDesc || 'لا يوجد وصف مضاف حالياً.',
        category: prodCategory,
        rating: { rate: 5.0, count: 1 },
        image: prodImage,
        featured: prodFeatured,
        stock: stockNum
      };

      await addProductToDB(newProduct);
      
      // Update state local catalog list
      setProducts(prev => [...prev, newProduct].sort((a,b) => a.id - b.id));
      setSuccessMessage(`تم إضافة المنتج الفاخر "${prodName}" بنجاح في قاعدة البيانات.`);
      
      // Clear helper fields
      setProdName('');
      setProdPrice('');
      setProdDesc('');
      setProdCategory('Electronics');
      setProdImage('');
      setProdStock('10');
      setProdFeatured(false);

      // Redirect to products tab after positive notification
      setTimeout(() => {
        setActiveTab('products');
        setSuccessMessage(null);
      }, 1500);

    } catch (err: any) {
      console.error("Failed to add product:", err);
      setFormError('عذراً، فشلت كتابة المنتج في Firestore. يرجى مراجعة القواعد الأمنية.');
    } finally {
      setSavingProduct(false);
    }
  };

  // Secure restricted screen if not signed in as administrator
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans animate-fade-in" id="admin-auth-restriction-screen">
        <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-2xl border border-gray-100 text-center">
          <div className="flex flex-col items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 mb-4 ring-8 ring-amber-50/50">
              <Lock className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">منطقة حماية خاصة بالمدير</h2>
            <p className="mt-3 text-sm text-gray-500 leading-relaxed max-w-sm">
              عذراً، لا تمتلك صلاحيات كافية للوصول إلى لوحة المبيعات والتحليلات. المسموح لهم بالدخول هم مشرفي البوتيك المعينين فقط.
            </p>
          </div>

          <div className="mt-8 space-y-4">
            <div className="text-xs text-indigo-600 bg-indigo-50/60 rounded-xl p-3 text-center border border-indigo-100/40">
              بريد المسؤول المصرح به: <span className="font-bold font-mono">ahmedvyally22@gmail.com</span> أو <span className="font-bold font-mono">admin@aura.com</span>
            </div>

            <button
              onClick={onClose}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              id="back-to-mall-from-lock"
            >
              <ArrowRight className="h-4 w-4" />
              <span>العودة لمتجر البوتيك الرئيسية</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafaf9] text-gray-900 font-sans flex flex-col lg:flex-row-reverse" id="admin-dashboard-container">
      
      {/* 1. Right-side Navigation Sidebar Menu (Perfect RTL Alignment) */}
      <aside className="w-full lg:w-72 bg-white border-b lg:border-b-0 lg:border-l border-gray-150 flex flex-col pt-6 shrink-0 z-20" id="admin-sidebar-menu">
        {/* Boutique Branded Header */}
        <div className="px-6 pb-6 border-b border-gray-100 text-right">
          <div className="flex items-center justify-between flex-row-reverse mb-2">
            <div className="flex items-center gap-3 flex-row-reverse">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-950 text-white font-mono text-sm font-bold shadow-md">
                A
              </div>
              <div>
                <h2 className="text-base font-black text-gray-900 tracking-wide">أورا بوتيك</h2>
                <p className="text-[10px] text-indigo-600 font-bold tracking-tight">بوابة الإدارة الشاملة</p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-colors"
              title="العودة للمتجر"
            >
              <ArrowRight className="h-4.5 w-4.5" />
            </button>
          </div>
          
          <div className="mt-4 bg-[#fafaf9] rounded-xl p-3 border border-gray-100 flex items-center gap-2.5 flex-row-reverse">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="text-xs text-gray-600 font-medium truncate" title={user?.email || ''}>
              المشرف: <span className="font-bold underline text-indigo-950">{user?.email === 'ahmedvyally22@gmail.com' ? 'أحمد كمال' : 'المدير الفني'}</span>
            </span>
          </div>
        </div>

        {/* Sidebar Tabs Links list */}
        <nav className="p-4 space-y-1 flex lg:flex-col overflow-x-auto lg:overflow-x-visible gap-2 lg:gap-1 text-right no-scrollbar" dir="rtl">
          
          {/* Tab 1: Overview and AI */}
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-xs font-semibold whitespace-nowrap min-w-[130px] lg:min-w-0 ${
              activeTab === 'overview'
                ? 'text-indigo-600 bg-indigo-50/70 font-bold border-r-4 border-indigo-600'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <LayoutDashboard className="h-4.5 w-4.5 shrink-0" />
            <span>نظرة عامة والتحليلات</span>
          </button>

          {/* Tab 2: Products Listing */}
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-xs font-semibold whitespace-nowrap min-w-[130px] lg:min-w-0 ${
              activeTab === 'products'
                ? 'text-indigo-600 bg-indigo-50/70 font-bold border-r-4 border-indigo-600'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Package className="h-4.5 w-4.5 shrink-0" />
            <span>إدارة المنتجات ({products.length})</span>
          </button>

          {/* Tab 3: Create New Product */}
          <button
            onClick={() => setActiveTab('add-product')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-xs font-semibold whitespace-nowrap min-w-[130px] lg:min-w-0 ${
              activeTab === 'add-product'
                ? 'text-indigo-600 bg-indigo-50/70 font-bold border-r-4 border-indigo-600'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <PlusCircle className="h-4.5 w-4.5 shrink-0" />
            <span>إضافة منتج جديد</span>
          </button>

          {/* Tab 4: Orders Ledger */}
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-xs font-semibold whitespace-nowrap min-w-[130px] lg:min-w-0 ${
              activeTab === 'orders'
                ? 'text-indigo-600 bg-indigo-50/70 font-bold border-r-4 border-indigo-600'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <FileText className="h-4.5 w-4.5 shrink-0" />
            <span>إدارة الطلبات ({orders.length})</span>
          </button>

        </nav>

        {/* System telemetry metadata footer (hidden on small screens) */}
        <div className="hidden lg:flex p-4 mt-auto border-t border-gray-100 flex-col gap-1 text-right px-6 text-[10px] text-gray-400">
          <div className="flex items-center justify-between flex-row-reverse">
            <span>اتصال السحابة:</span>
            <span className="text-emerald-500 font-bold">● متصل ومحمي</span>
          </div>
          <div className="flex items-center justify-between flex-row-reverse">
            <span>قاعدة البيانات:</span>
            <span>Firestore Enterprise</span>
          </div>
        </div>
      </aside>

      {/* 2. Left-side Primary Content Workspace Component */}
      <main className="flex-1 p-4 sm:p-8 lg:p-10 overflow-y-auto" id="admin-main-viewport">
        
        {/* Dynamic global Notification Toast Alert */}
        {successMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-emerald-500 text-white text-xs font-bold rounded-2xl flex items-center justify-between gap-3 shadow-lg"
            id="admin-success-toast"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
              <span>{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage(null)} className="text-[9px] underline cursor-pointer hover:opacity-80">إغلاق</button>
          </motion.div>
        )}

        {/* TAB WORKSPACE: overview AND ANALYTICS */}
        {activeTab === 'overview' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            {/* Header Title */}
            <div className="text-right">
              <h1 className="text-2xl font-black text-gray-900">نظرة عامة والتحليلات الذكية</h1>
              <p className="text-xs text-gray-400 mt-1">مؤشرات الأداء المالي وإحصاءات المبيعات وسجل النشاط من سحابة Firestore</p>
            </div>

            {/* General Metrics Rows */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="stats-tiles-grid">
              {/* Metric 1 */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
                <div className="space-y-1 text-right w-full">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 block">إجمالي المبيعات المحصلة</span>
                  <span className="text-2xl font-black text-gray-900 font-mono tracking-tight block">
                    ${stats.totalSales.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 justify-end">
                    <TrendingUp className="h-3 w-3" />
                    <span>أداء مالي مستقر ومتنامي</span>
                  </span>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 mr-4 shrink-0">
                  <DollarSign className="h-5.5 w-5.5" />
                </div>
              </div>

              {/* Metric 2 */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
                <div className="space-y-1 text-right w-full">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 block">حقائب الشراء المنجزة</span>
                  <span className="text-2xl font-black text-gray-900 font-mono tracking-tight block">
                    {stats.ordersCount} معاملة
                  </span>
                  <span className="text-[10px] text-indigo-600 font-bold block">مكتمل مع الفواتير الموثقة</span>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 mr-4 shrink-0">
                  <ShoppingBag className="h-5.5 w-5.5" />
                </div>
              </div>

              {/* Metric 3 */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
                <div className="space-y-1 text-right w-full">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 block">كتالوج المنتجات المعروضة</span>
                  <span className="text-2xl font-black text-gray-900 font-mono tracking-tight block">
                    {products.length} فئات وسلع
                  </span>
                  <span className="text-[10px] text-purple-600 font-bold block">إجمالي مخزون المعرض المتوفر</span>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600 mr-4 shrink-0">
                  <Package className="h-5.5 w-5.5" />
                </div>
              </div>
            </div>

            {/* AI Advisor Panel Module */}
            <div className="bg-gradient-to-r from-gray-950 via-indigo-950 to-gray-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
              <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -translate-y-20 translate-x-20 pointer-events-none" />
              
              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="space-y-2 text-right">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-300">
                    <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                    <span>مستشار الذكاء الاصطناعي الفني لـ أورا</span>
                  </div>
                  <h2 className="text-xl font-bold tracking-tight">تقرير التحليل المالي والمخزون التلقائي من Gemini AI</h2>
                  <p className="text-xs text-gray-300 max-w-xl leading-relaxed">
                    بنقرة واحدة، سيقوم الذكاء الاصطناعي بربط وفحص قائمة المبيعات النشطة وعلاقتها بتصنيفات المنتجات من مستودع البيانات السحابي ليعد لك دراسة استراتيجية فورية تفصيلية بالعربية لتطوير قيمة سلة التسوق.
                  </p>
                </div>

                <button
                  onClick={handleAIAnalysis}
                  disabled={generatingReport || loading}
                  className="flex items-center justify-center gap-2.5 rounded-2xl bg-white text-gray-950 hover:bg-indigo-50 active:scale-98 disabled:opacity-50 py-3.5 px-6 font-bold text-xs tracking-tight cursor-pointer transition-all shadow-lg shrink-0"
                >
                  {generatingReport ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                      <span>جاري المعالجة والتحليل...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 text-indigo-600" />
                      <span>توليد التقرير الاستشاري المطور</span>
                    </>
                  )}
                </button>
              </div>

              {/* AI Report Viewport Wrapper */}
              {(aiReport || generatingReport || aiError) && (
                <div className="mt-8 pt-8 border-t border-white/10 relative z-10" id="ai-advisor-response-viewport">
                  {generatingReport && (
                    <div className="flex flex-col items-center justify-center py-10 space-y-3">
                      <div className="relative">
                        <div className="h-10 w-10 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
                        <Sparkles className="h-4.5 w-4.5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-300" />
                      </div>
                      <p className="text-xs text-indigo-250 font-bold">يقوم Gemini AI حالياً بتحليل صفقات البوتيك وسلاسل التوريد...</p>
                    </div>
                  )}

                  {aiError && (
                    <div className="bg-rose-500/15 border border-rose-500/20 rounded-2xl p-4 flex items-center gap-3 text-rose-200 text-xs text-right direction-rtl">
                      <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />
                      <div>
                        <span className="font-bold">عذراً، تعذر صياغة التقرير:</span> {aiError}
                      </div>
                    </div>
                  )}

                  {aiReport && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white text-gray-900 rounded-2xl p-6 sm:p-8 space-y-4 border border-gray-150 shadow-2xl"
                    >
                      <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                        <div className="flex items-center gap-2">
                          <div className="h-9 w-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <FileText className="h-5 w-5" />
                          </div>
                          <span className="text-sm font-black text-gray-900">التحليل الاستراتيجي التنفيذي - بوندورا أورا</span>
                        </div>
                        <span className="text-[10px] font-semibold text-gray-400 uppercase font-mono bg-gray-50 px-2 py-1 rounded">AURA-v3.5</span>
                      </div>

                      {/* Render Arabic markdown */}
                      <div className="markdown-body prose prose-indigo max-w-none text-right font-sans leading-relaxed text-gray-700 space-y-3 text-sm direction-rtl select-text">
                        <Markdown>{aiReport}</Markdown>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* TAB WORKSPACE: PRODUCT MANAGEMENT (LIST AND CRUD DELETE) */}
        {activeTab === 'products' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            {/* Title Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-right">
              <div>
                <h1 className="text-2xl font-black text-gray-900">إدارة كتالوج المنتجات</h1>
                <p className="text-xs text-gray-400 mt-1">عرض سلع المتجر وحذف الفئات والقطع التالفة حياً من قاعدة البيانات S-Cloud</p>
              </div>

              <button
                onClick={() => setActiveTab('add-product')}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 text-white hover:bg-indigo-600 py-2.5 px-4 font-bold text-xs cursor-pointer shadow-sm transition-colors self-start sm:self-auto"
              >
                <Plus className="h-4 w-4" />
                <span>إضافة منتج فاخر جديد</span>
              </button>
            </div>

            {/* Catalog Grid View */}
            <div className="bg-white rounded-3xl border border-gray-150 shadow-xs overflow-hidden">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-24 space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                  <p className="text-xs text-gray-400">جاري تحميل السلع الحالية بقاعدة البيانات...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="p-16 text-center text-gray-400 space-y-2">
                  <Package className="h-12 w-12 mx-auto text-gray-200 mb-2" />
                  <p className="text-sm font-bold">لا توجد منتجات مسجلة في قاعدة البيانات حالياً</p>
                  <button
                    onClick={fetchDashboardData}
                    className="text-xs text-indigo-600 font-bold underline"
                  >
                    انقر هنا لإعادة المزامنة والتحميل
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-right" dir="rtl">
                    <thead className="text-[11px] uppercase tracking-wider text-gray-400 bg-gray-50 border-b border-gray-100 font-bold">
                      <tr>
                        <th scope="col" className="px-6 py-4">صورة المنتج والمعلومات</th>
                        <th scope="col" className="px-6 py-4">الفئة القسم</th>
                        <th scope="col" className="px-6 py-4">سعر البيع</th>
                        <th scope="col" className="px-6 py-4">المخزون المتوفر</th>
                        <th scope="col" className="px-6 py-4">المميز</th>
                        <th scope="col" className="px-6 py-4 text-left">إجراءات تصفية السلعة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {products.map((p) => (
                        <tr key={p.id} className="hover:bg-[#fafaf9]/40 transition-colors">
                          {/* Image & Name & Description */}
                          <td className="px-6 py-4 flex items-center gap-4 flex-row-reverse text-right">
                            <img
                              src={p.image}
                              alt={p.name}
                              referrerPolicy="no-referrer"
                              className="h-12 w-12 rounded-xl object-cover border border-gray-100 shadow-sm shrink-0"
                              onError={(e) => {
                                // Fallback image check
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=200';
                              }}
                            />
                            <div className="space-y-0.5 truncate max-w-xs md:max-w-sm">
                              <span className="block font-bold text-gray-900 text-xs truncate">{p.name}</span>
                              <span className="block text-[10px] text-gray-400 truncate max-w-xs">{p.description}</span>
                              <span className="block text-[9px] text-gray-400 font-mono">معرّف الرقم: #{p.id}</span>
                            </div>
                          </td>

                          {/* Category Tag */}
                          <td className="px-6 py-4">
                            <span className="inline-block bg-gray-100 rounded-lg px-2.5 py-1 text-[10px] font-semibold text-gray-700">
                              {p.category === 'Electronics' ? 'الأجهزة والتقنيات' :
                               p.category === 'Fashion & Apparel' ? 'الأزياء والملابس' :
                               p.category === 'Accessories & Jewelry' ? 'الإكسسوارات الفاخرة' :
                               p.category === 'Home & Living' ? 'المنزل والمعيشة' : p.category}
                            </span>
                          </td>

                          {/* Price */}
                          <td className="px-6 py-4 font-mono font-black text-gray-900 text-xs">
                            ${p.price.toFixed(2)}
                          </td>

                          {/* Stock quantity */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5 flex-row-reverse justify-end">
                              <span className={`font-mono font-bold text-xs ${p.stock <= 3 ? 'text-rose-600' : 'text-gray-800'}`}>
                                {p.stock} قطعة
                              </span>
                              {p.stock <= 3 && (
                                <span className="text-[9px] font-black bg-rose-50 text-rose-600 rounded px-1">مخزون حرج!</span>
                              )}
                            </div>
                          </td>

                          {/* Featured badge toggle display state */}
                          <td className="px-6 py-4">
                            {p.featured ? (
                              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-700 bg-amber-50 rounded-full px-2 py-0.5">
                                <Sparkles className="h-2.5 w-2.5 text-amber-500 animate-pulse" />
                                <span>مميز بالصفحة الأولى</span>
                              </span>
                            ) : (
                              <span className="text-gray-300 text-[10px]">-</span>
                            )}
                          </td>

                          {/* Deletion button column */}
                          <td className="px-6 py-4 text-left">
                            <button
                              disabled={isDeleting === p.id}
                              onClick={() => handleDeleteProduct(p.id, p.name)}
                              className="p-2 text-rose-500 hover:text-rose-700 disabled:opacity-40 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                              title="حذف هذا المنتج فوراً من قاعدة البيانات"
                            >
                              {isDeleting === p.id ? (
                                <Loader2 className="h-4.5 w-4.5 animate-spin" />
                              ) : (
                                <Trash2 className="h-4.5 w-4.5" />
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* TAB WORKSPACE: ADD NEW PRODUCT FORM WRITING TO DB */}
        {activeTab === 'add-product' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-3xl mx-auto space-y-6"
          >
            {/* Title Header */}
            <div className="text-right">
              <h1 className="text-2xl font-black text-gray-900">إضافة لوحة جديدة لمنتج فاخر</h1>
              <p className="text-xs text-gray-400 mt-1">تعبئة المزايا الفنية لرفع الكتالوج حياً لملايين زبائن متجر أورا السحابي</p>
            </div>

            {/* Error alerts */}
            {formError && (
              <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 text-xs flex items-center gap-2 direction-rtl text-right">
                <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleAddProductSubmit} className="bg-white rounded-3xl border border-gray-150 p-6 sm:p-8 space-y-6 text-right">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6" dir="rtl">
                
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700">اسم المنتج الفاخر <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: حقيبة ديور المخملية الفاخرة"
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    className="w-full text-right rounded-xl border border-gray-200 px-4 py-2.5 text-xs outline-none focus:border-indigo-600 bg-gray-50/50"
                  />
                </div>

                {/* S-Price */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700">سعر البيع الافتراضى ($) <span className="text-rose-500">*</span></label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="250.00"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    className="w-full text-right rounded-xl border border-gray-200 px-4 py-2.5 text-xs outline-none focus:border-indigo-600 bg-gray-50/50 font-mono font-bold"
                  />
                </div>

                {/* Category Picker */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700">قسم التصنيفات الرئيي <span className="text-rose-500">*</span></label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-xs outline-none focus:border-indigo-600 bg-gray-50/50"
                  >
                    <option value="Electronics">الأجهزة والتقنيات (Electronics)</option>
                    <option value="Fashion & Apparel">الأزياء والملابس (Fashion & Apparel)</option>
                    <option value="Accessories & Jewelry">الإكسسوارات والمجوهرات (Accessories & Jewelry)</option>
                    <option value="Home & Living">المنزل والمعيشة (Home & Living)</option>
                  </select>
                </div>

                {/* Product Inventory Stock Count */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700">كمية المخزون الافتتاحي <span className="text-rose-500">*</span></label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="10"
                    value={prodStock}
                    onChange={(e) => setProdStock(e.target.value)}
                    className="w-full text-right rounded-xl border border-gray-200 px-4 py-2.5 text-xs outline-none focus:border-indigo-600 bg-gray-50/50 font-mono font-bold"
                  />
                </div>

              </div>

              {/* تحميل ملف الصورة من الجهاز بترميز Base64 مع الدعم الكامل للسحب والإفلات */}
              <div className="space-y-1.5" id="admin-image-upload-wrapper">
                <label className="block text-xs font-bold text-gray-700">تحميل صورة المنتج من جهازك <span className="text-rose-500">*</span></label>
                
                <div 
                  className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 rounded-2xl hover:border-indigo-500 transition-colors bg-gray-50/30 cursor-pointer relative"
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const files = e.dataTransfer.files;
                    if (files && files[0]) {
                      const f = files[0];
                      if (!f.type.startsWith('image/')) {
                        setFormError('يرجى اختيار ملف صورة صالح فقط.');
                        return;
                      }
                      if (f.size > 15 * 1024 * 1024) {
                        setFormError('حجم الصورة كبير جداً! يرجى اختيار صورة أقل من 15 ميجابايت.');
                        return;
                      }
                      setFormError(null);
                      const reader = new FileReader();
                      reader.onload = (loadEvent) => {
                        if (loadEvent.target?.result) {
                          const rawBase64 = loadEvent.target.result as string;
                          compressImage(rawBase64).then((compressedBase64) => {
                            setProdImage(compressedBase64);
                          });
                        }
                      };
                      reader.readAsDataURL(f);
                    }
                  }}
                >
                  <div className="space-y-1 text-center">
                    <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-xs text-gray-600 justify-center">
                      <label className="relative bg-white rounded-md font-bold text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500 cursor-pointer">
                        <span>اختر صورة من الملفات</span>
                        <input 
                          type="file" 
                          required={!prodImage}
                          accept="image/*"
                          onChange={(e) => {
                            const files = e.target.files;
                            if (files && files[0]) {
                              const f = files[0];
                              if (f.size > 15 * 1024 * 1024) {
                                setFormError('حجم الصورة كبير جداً! يرجى اختيار صورة أقل من 15 ميجابايت.');
                                return;
                              }
                              setFormError(null);
                              const reader = new FileReader();
                              reader.onload = (loadEvent) => {
                                if (loadEvent.target?.result) {
                                  const rawBase64 = loadEvent.target.result as string;
                                  compressImage(rawBase64).then((compressedBase64) => {
                                    setProdImage(compressedBase64);
                                  });
                                }
                              };
                              reader.onerror = () => {
                                setFormError('حدث خطأ أثناء قراءة ملف الصورة.');
                              };
                              reader.readAsDataURL(f);
                            }
                          }}
                          className="sr-only" 
                        />
                      </label>
                      <p className="pr-1">أو اسحبها وأفلتها هنا</p>
                    </div>
                    <p className="text-[10px] text-gray-400">تدعم صيغ PNG, JPG, JPEG أو GIF حتى حجم 5 ميجابايت (يتم تشفيرها وحفظها كـ Base64 تلقائياً)</p>
                  </div>
                </div>

                {prodImage && (
                  <div className="mt-3 flex items-center justify-between bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100 inline-flex flex-row-reverse w-full" dir="rtl">
                    <div className="flex items-center gap-3">
                      <img 
                        src={prodImage} 
                        alt="معاينة حية للمظهر" 
                        className="h-16 w-16 object-cover rounded-xl border border-gray-100 shadow-sm" 
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=200';
                        }}
                      />
                      <div className="text-right">
                        <span className="block text-xs font-bold text-emerald-800">تم اختيار الصورة ومعالجتها بنجاح!</span>
                        <span className="block text-[10px] text-emerald-600">جاهزة للحفظ المباشر داخل Firestore كـ Base64 String طويل.</span>
                      </div>
                    </div>
                    
                    <button 
                      type="button"
                      onClick={() => setProdImage('')}
                      className="text-xs font-semibold text-rose-500 hover:text-rose-700 hover:underline cursor-pointer"
                    >
                      حذف الصورة
                    </button>
                  </div>
                )}
              </div>

              {/* Description TextArea */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">الوصف التفصيلي والقصة الفنية للمنتج</label>
                <textarea
                  rows={4}
                  placeholder="سطور موجزة تبرز جمالية وأسلوب صنع هذه السلعة الفاخرة لتشجيع رغبة الشراء لدى الضيوف..."
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  className="w-full text-right rounded-xl border border-gray-200 p-4 text-xs outline-none focus:border-indigo-600 bg-gray-50/50 leading-relaxed font-sans"
                />
              </div>

              {/* Featured toggle switch option */}
              <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between flex-row-reverse">
                <div className="text-right">
                  <span className="block text-xs font-bold text-gray-900">هل تود إدراج هذا المنتج في واجهة القطع المميزة؟</span>
                  <span className="block text-[10px] text-gray-400">ستظهر هذه القطعة الكريستالية فوراً في قسم البوتيك الأبرز لتبهر الزوار بسرعة.</span>
                </div>
                
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={prodFeatured}
                    onChange={(e) => setProdFeatured(e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {/* Submit panel button */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={savingProduct}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-gray-900 text-white hover:bg-indigo-600 active:scale-98 disabled:opacity-50 py-3.5 px-8 font-bold text-xs cursor-pointer shadow-lg transition-all"
                >
                  {savingProduct ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>جاري حفظ المنتج وإرسال السجلات...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>حفظ المنتج الفاخر ونشره حياً</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </motion.div>
        )}

        {/* TAB WORKSPACE: ORDERS LEDGER (DASHBOARD ORDERS TABLE) */}
        {activeTab === 'orders' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            {/* Title Header */}
            <div className="text-right flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-gray-900">سجل طلبات ومعاملات الضيوف</h1>
                <p className="text-xs text-gray-400 mt-1">تفاصيل فواتير السداد والتعاملات الحية الناتجة من تفعيل حقائب الشراء بالمعرض</p>
              </div>

              <button
                onClick={fetchDashboardData}
                disabled={loading}
                className="rounded-xl border border-gray-200 bg-white py-2 px-4 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                تحديث معاملات Firestore
              </button>
            </div>

            {/* Table Component */}
            <div className="bg-white rounded-3xl border border-gray-150 shadow-xs overflow-hidden">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-24 space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                  <p className="text-xs text-gray-400">جاري تحميل وسحب الفواتير التفصيلية...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="p-16 text-center text-gray-400 space-y-2">
                  <ShoppingBag className="h-12 w-12 mx-auto text-gray-200 mb-2" />
                  <p className="text-sm font-bold">لا يوجد أي مبيعات معتمدة بقاعدة البيانات الموثقة</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-right" id="dashboard-orders-table">
                    <thead className="text-[11px] uppercase tracking-wider text-gray-400 bg-gray-50 border-b border-gray-100 font-bold">
                      <tr>
                        <th scope="col" className="px-6 py-4">رقم المعاملة</th>
                        <th scope="col" className="px-6 py-4">اسم العميل والضيف</th>
                        <th scope="col" className="px-6 py-4">البريد الإلكتروني للعميل</th>
                        <th scope="col" className="px-6 py-4">المنتجات وسلل المحتويات</th>
                        <th scope="col" className="px-6 py-4">تاريخ المعاملة والوقت</th>
                        <th scope="col" className="px-6 py-4 text-left">مجموع القيمة والحالة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                          {/* Transaction ID */}
                          <td className="px-6 py-4 font-mono text-xs font-bold text-gray-900">
                            {order.id}
                          </td>
                          
                          {/* Buyer name */}
                          <td className="px-6 py-4 font-semibold text-gray-800">
                            {order.customerName}
                          </td>

                          {/* Email code */}
                          <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                            {order.userEmail}
                          </td>

                          {/* Items summarized */}
                          <td className="px-6 py-4 max-w-xs">
                            <div className="truncate text-xs text-gray-600" title={order.items?.map(i => `${i.productName} (x${i.quantity})`).join(', ')}>
                              {order.items?.map((item: any) => (
                                <span key={item.productId} className="inline-block bg-gray-100 rounded-lg px-2 py-0.5 text-[10px] text-gray-700 ml-1 mb-1 font-sans">
                                  {item.productName} <span className="text-indigo-600 font-bold font-mono">x{item.quantity}</span>
                                </span>
                              ))}
                            </div>
                          </td>

                          {/* Time */}
                          <td className="px-6 py-4 text-gray-500 text-xs">
                            <div className="flex items-center gap-1.5 justify-end">
                              <Clock className="h-3.5 w-3.5 text-gray-400" />
                              <span>{order.createdAt.toLocaleDateString('ar-SA', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                              <span className="text-[10px] text-gray-400 font-mono">{order.createdAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </td>

                          {/* Total and badges */}
                          <td className="px-6 py-4 text-left font-mono text-sm font-black text-gray-950">
                            <div className="flex flex-col items-start gap-1">
                              <span>${order.total.toFixed(2)}</span>
                              
                              <div className="flex flex-wrap gap-1 mt-1 justify-start">
                                {/* طريقة الدفع */}
                                <span className={`inline-flex items-center gap-0.5 text-[9px] font-bold rounded-full px-1.5 py-0.5 ${order.paymentMethod === 'COD' ? 'text-indigo-600 bg-indigo-50 border border-indigo-100' : 'text-emerald-600 bg-emerald-50 border border-emerald-100'}`}>
                                  <span>{order.paymentMethod === 'COD' ? 'عند الاستلام (COD)' : 'بطاقة ائتمان'}</span>
                                </span>

                                {/* حالة المعالجة */}
                                <span className={`inline-flex items-center gap-0.5 text-[9px] font-bold rounded-full px-1.5 py-0.5 ${order.status === 'processing' ? 'text-amber-600 bg-amber-50 border border-amber-100' : 'text-emerald-600 bg-emerald-50 border border-emerald-100'}`}>
                                  <span>{order.status === 'processing' ? 'قيد المعالجة' : 'مدفوع'}</span>
                                </span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}

      </main>

    </div>
  );
}
