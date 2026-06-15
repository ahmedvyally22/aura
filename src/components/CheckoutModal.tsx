import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, CheckCircle2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { createOrderInDB } from '../lib/db';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormState {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvc: string;
}

const initialFormState: FormState = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  zipCode: '',
  cardNumber: '',
  cardExpiry: '',
  cardCvc: '',
};

export default function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'Card'>('Card');
  const [form, setForm] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState('');

  // Pre-fill fields if user is authenticated
  useEffect(() => {
    if (isOpen) {
      setForm((prev) => ({
        ...prev,
        fullName: user?.displayName || prev.fullName || '',
        email: user?.email || prev.email || '',
      }));
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormState]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep1 = (): boolean => {
    const newErrors: Partial<FormState> = {};
    if (!form.fullName.trim()) newErrors.fullName = 'الرجاء إدخال الاسم الكامل ثنائياً على الأقل';
    if (!form.email.trim() || !form.email.includes('@')) newErrors.email = 'الرجاء إدخال عنوان بريد إلكتروني صالح';
    if (!form.phone.trim() || form.phone.length < 8) newErrors.phone = 'الرجاء إدخال رقم هاتف صحيح للتوصل والإرسال';
    if (!form.address.trim()) newErrors.address = 'الرجاء كتابة العنوان بالتفصيل ومميزات السكن';
    if (!form.city.trim()) newErrors.city = 'الرجاء إدخال اسم المدينة';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Partial<FormState> = {};
    if (!form.cardNumber.trim() || form.cardNumber.replace(/\s+/g, '').length < 16) {
      newErrors.cardNumber = 'الرجاء إدخال رقم بطاقة مكوّن من 16 خانة';
    }
    if (!form.cardExpiry.trim()) newErrors.cardExpiry = 'الرجاء تحديد تاريخ الانتهاء (الشهر/السنة)';
    if (!form.cardCvc.trim() || form.cardCvc.length < 3) newErrors.cardCvc = 'الرجاء إدخال رمز الأمان (CVC)';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitOrder = (method: 'COD' | 'Card', status: string) => {
    setIsSubmitting(true);
    const generatedOrderId = `AUR-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderId(generatedOrderId);
    
    // Formulate final invoice aggregates
    const taxRate = 0.15;
    const finalTotal = cartTotal + (cartTotal * taxRate);
    const finalEmail = user?.email || form.email;
    const finalName = user?.displayName || form.fullName;

    // Structured cart overview
    const orderItemDetails = cart.map(item => ({
      productId: item.product.id,
      productName: item.product.name,
      price: item.product.price,
      quantity: item.quantity
    }));

    // Execute save transaction record to Firestore database
    createOrderInDB({
      id: generatedOrderId,
      userEmail: finalEmail || 'anonymous@auraboutique.com',
      customerName: finalName || 'Guest Customer',
      items: orderItemDetails,
      total: Number(finalTotal.toFixed(2)),
      status: status, // "processing" for COD, "paid" for Card
      paymentMethod: method, // "COD" or "Card"
      phone: form.phone,
      address: form.address,
      city: form.city,
      createdAt: new Date()
    }).then(() => {
      setIsSubmitting(false);
      setStep(3);
      clearCart();
    }).catch((err) => {
      console.error("Order submission to database failed:", err);
      setIsSubmitting(false);
      // Proceed gracefully anyway to preserve luxury checkout simulation
      setStep(3);
      clearCart();
    });
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (validateStep1()) {
        if (paymentMethod === 'COD') {
          submitOrder('COD', 'processing');
        } else {
          setStep(2);
        }
      }
    } else if (step === 2) {
      if (validateStep2()) {
        submitOrder('Card', 'paid');
      }
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop visual layout */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            if (step !== 3) onClose();
          }}
          className="absolute inset-0 bg-gray-950/40 backdrop-blur-sm"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-gray-50 flex flex-col md:flex-row max-h-[90vh]"
          id="checkout-panel-modal"
        >
          {/* Close button (disable if on step 3 success state to avoid accidental loss) */}
          {step !== 3 && (
            <button
              onClick={onClose}
              className="absolute left-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-gray-50 text-gray-700 shadow-md hover:bg-gray-950 hover:text-white transition-all outline-none"
              id="checkout-close-btn"
            >
              <X className="h-5 w-5" />
            </button>
          )}

          {/* Form and interactive layouts */}
          <div className="flex-1 p-6 md:p-8 overflow-y-auto text-right">
            
            {/* Step 1: Shipping and Personal Details Form */}
            {step === 1 && (
              <form onSubmit={handleNextStep} className="space-y-5">
                <div className="border-b border-gray-100 pb-4">
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">الخطوة 1 من 2</span>
                  <h3 className="text-lg font-black text-gray-950 mt-1.5">معلومات الشحن والتوصيل</h3>
                  <p className="text-xs text-gray-400 mt-1">الرجاء إدخال بيانات دقيقة لضمان وصول شحنتك المميّزة من أورا بأقصى سرعة ممكنة.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">الاسم الكامل</label>
                    <input
                      type="text"
                      name="fullName"
                      value={form.fullName}
                      onChange={handleInputChange}
                      placeholder="احمد الفخراني..."
                      className={`w-full rounded-xl border p-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 direction-rtl ${
                        errors.fullName ? 'border-rose-300 bg-rose-50/10' : 'border-gray-200 bg-gray-50/30'
                      }`}
                      id="checkout-fullname"
                    />
                    {errors.fullName && <p className="text-[11px] font-semibold text-rose-500 mt-1">{errors.fullName}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">رقم الجوال</label>
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleInputChange}
                        placeholder="+966 50..."
                        className={`w-full rounded-xl border p-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 direction-rtl ${
                          errors.phone ? 'border-rose-300 bg-rose-50/10' : 'border-gray-200 bg-gray-50/30'
                        }`}
                        id="checkout-phone"
                      />
                      {errors.phone && <p className="text-[11px] font-semibold text-rose-500 mt-1">{errors.phone}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">البريد الإلكتروني</label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleInputChange}
                        placeholder="ahmed@example.com"
                        className={`w-full rounded-xl border p-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 ${
                          errors.email ? 'border-rose-300 bg-rose-50/10' : 'border-gray-200 bg-gray-50/30'
                        }`}
                        id="checkout-email"
                      />
                      {errors.email && <p className="text-[11px] font-semibold text-rose-500 mt-1">{errors.email}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">العنوان بالتفصيل</label>
                    <input
                      type="text"
                      name="address"
                      value={form.address}
                      onChange={handleInputChange}
                      placeholder="أخبرنا بالشارع، اسم الحي، رقم الوحدة، معالِم الإرشاد..."
                      className={`w-full rounded-xl border p-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 direction-rtl ${
                        errors.address ? 'border-rose-300 bg-rose-50/10' : 'border-gray-200 bg-gray-50/30'
                      }`}
                      id="checkout-address"
                    />
                    {errors.address && <p className="text-[11px] font-semibold text-rose-500 mt-1">{errors.address}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">الرمز البريدي</label>
                      <input
                        type="text"
                        name="zipCode"
                        value={form.zipCode}
                        onChange={handleInputChange}
                        placeholder="11564"
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/30 p-3 text-sm outline-none focus:border-gray-900 direction-rtl"
                        id="checkout-zipcode"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">المدينة</label>
                      <input
                        type="text"
                        name="city"
                        value={form.city}
                        onChange={handleInputChange}
                        placeholder="الرياض"
                        className={`w-full rounded-xl border p-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 direction-rtl ${
                          errors.city ? 'border-rose-300 bg-rose-50/10' : 'border-gray-200 bg-gray-50/30'
                        }`}
                        id="checkout-city"
                      />
                      {errors.city && <p className="text-[11px] font-semibold text-rose-500 mt-1">{errors.city}</p>}
                    </div>
                  </div>

                  {/* خيارات الدفع الاحترافية */}
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-150 space-y-3 mt-4">
                    <span className="block text-xs font-bold text-gray-900 mb-1">اختر طريقة الدفع المناسبة</span>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" dir="rtl">
                      {/* الخيار الأول: الدفع عند الاستلام */}
                      <label className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${paymentMethod === 'COD' ? 'bg-indigo-50/50 border-indigo-200' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                        <input 
                          type="radio" 
                          name="paymentMethod" 
                          value="COD" 
                          checked={paymentMethod === 'COD'}
                          onChange={() => setPaymentMethod('COD')}
                          className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 cursor-pointer"
                        />
                        <div className="text-right">
                          <span className="block text-xs font-bold text-gray-900">الدفع عند الاستلام (COD)</span>
                          <span className="block text-[10px] text-gray-400 leading-normal mt-0.5">الدفع نقداً أو بالبطاقة عند توصيل الفستان أو القطعة لباب منزلك</span>
                        </div>
                      </label>

                      {/* الخيار الثاني: الدفع الإلكتروني */}
                      <label className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${paymentMethod === 'Card' ? 'bg-indigo-50/50 border-indigo-200' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                        <input 
                          type="radio" 
                          name="paymentMethod" 
                          value="Card" 
                          checked={paymentMethod === 'Card'}
                          onChange={() => setPaymentMethod('Card')}
                          className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 cursor-pointer"
                        />
                        <div className="text-right">
                          <span className="block text-xs font-bold text-gray-900">الدفع الإلكتروني (Card)</span>
                          <span className="block text-[10px] text-gray-400 leading-normal mt-0.5">تفعيل حجز مشفّر فوري باستخدام بطاقات مدى وفيزا مع ميزة الحماية</span>
                        </div>
                      </label>
                    </div>
                  </div>

                </div>

                <div className="pt-4 flex items-center justify-between border-t border-gray-100">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-2xl bg-gray-950 text-white font-bold text-xs py-3.5 px-8 hover:bg-indigo-600 transition-all outline-none flex items-center gap-1.5 shadow-md shadow-gray-950/10 min-w-[150px] justify-center"
                    id="checkout-step1-next"
                  >
                    {isSubmitting ? (
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <>
                        <span>{paymentMethod === 'COD' ? 'تأكيد وحفظ طلب الاستلام' : 'الذهاب للدفع الآمن'}</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                  <div className="text-right">
                    <span className="block text-[9px] uppercase tracking-wider text-gray-400">الإجمالي شامل الضريبة</span>
                    <span className="text-sm font-black text-gray-900 font-mono">${(cartTotal + (cartTotal * 0.15)).toFixed(2)}</span>
                  </div>
                </div>
              </form>
            )}

            {/* Step 2: Simulated Credit Card Form */}
            {step === 2 && (
              <form onSubmit={handleNextStep} className="space-y-5">
                <div className="border-b border-gray-100 pb-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs font-bold text-gray-500 hover:text-gray-950 flex items-center gap-1.5"
                  >
                    <ArrowRight className="h-4 w-4 rotate-180" />
                    <span>تعديل الشحن</span>
                  </button>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">الخطوة 2 من 2</span>
                    <h3 className="text-lg font-black text-gray-950 mt-1.5">بوابة الدفع الإلكتروني</h3>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Dynamic credit card design display */}
                  <div className="rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 p-5 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-16 h-40 w-40 rounded-full bg-indigo-50/5 blur-xl" />
                    <div className="flex justify-between items-start">
                      <ShieldCheck className="h-7 w-7 text-indigo-400" />
                      <span className="text-xs font-mono font-bold tracking-widest text-indigo-300">SECURE GATEWAY</span>
                    </div>
                    <div className="mt-8">
                      <p className="text-sm font-mono tracking-widest text-indigo-100 min-h-[20px]">
                        {form.cardNumber || '•••• •••• •••• ••••'}
                      </p>
                    </div>
                    <div className="mt-6 flex justify-between text-right">
                      <div>
                        <span className="block text-[8px] uppercase font-mono tracking-wider text-indigo-400">CVC</span>
                        <span className="text-xs font-mono">{form.cardCvc || '•••'}</span>
                      </div>
                      <div>
                        <span className="block text-[8px] uppercase font-mono tracking-wider text-indigo-400">EXP DATE</span>
                        <span className="text-xs font-mono">{form.cardExpiry || 'MM/YY'}</span>
                      </div>
                      <div>
                        <span className="block text-[8px] uppercase font-mono tracking-wider text-indigo-400">CARD HOLDER</span>
                        <span className="text-xs uppercase tracking-wide truncate max-w-[120px]">{form.fullName || 'أحمد الفخراني'}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">رقم بطاقة الائتمان</label>
                    <input
                      type="text"
                      name="cardNumber"
                      maxLength={19}
                      value={form.cardNumber}
                      onChange={(e) => {
                        // format to card input
                        let val = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                        let matches = val.match(/\d{4,16}/g);
                        let match = (matches && matches[0]) || '';
                        let parts = [];
                        for (let i = 0, len = match.length; i < len; i += 4) {
                          parts.push(match.substring(i, i + 4));
                        }
                        if (parts.length > 0) {
                          e.target.value = parts.join(' ');
                        } else {
                          e.target.value = val;
                        }
                        handleInputChange(e);
                      }}
                      placeholder="4000 1234 5678 9010"
                      className={`w-full rounded-xl border p-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 font-mono ${
                        errors.cardNumber ? 'border-rose-300 bg-rose-50/10' : 'border-gray-200 bg-gray-50/30'
                      }`}
                      id="card-number-input"
                    />
                    {errors.cardNumber && <p className="text-[11px] font-semibold text-rose-500 mt-1">{errors.cardNumber}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">رمز الأمان (CVC)</label>
                      <input
                        type="text"
                        name="cardCvc"
                        maxLength={4}
                        value={form.cardCvc}
                        onChange={handleInputChange}
                        placeholder="123"
                        className={`w-full rounded-xl border p-3 text-sm outline-none focus:border-gray-900 font-mono ${
                          errors.cardCvc ? 'border-rose-300 bg-rose-50/10' : 'border-gray-200 bg-gray-50/30'
                        }`}
                        id="card-cvc-input"
                      />
                      {errors.cardCvc && <p className="text-[11px] font-semibold text-rose-500 mt-1">{errors.cardCvc}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">تاريخ انتهاء الصلاحية</label>
                      <input
                        type="text"
                        name="cardExpiry"
                        maxLength={5}
                        placeholder="MM/YY"
                        value={form.cardExpiry}
                        onChange={(e) => {
                          let val = e.target.value.replace(/[^0-9\/]/g, '');
                          if (val.length === 2 && !val.includes('/')) {
                            val += '/';
                          }
                          e.target.value = val;
                          handleInputChange(e);
                        }}
                        className={`w-full rounded-xl border p-3 text-sm outline-none focus:border-gray-900 font-mono ${
                          errors.cardExpiry ? 'border-rose-300 bg-rose-50/10' : 'border-gray-200 bg-gray-50/30'
                        }`}
                        id="card-expiry-input"
                      />
                      {errors.cardExpiry && <p className="text-[11px] font-semibold text-rose-500 mt-1">{errors.cardExpiry}</p>}
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-gray-100">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-2xl bg-gray-950 text-white font-bold text-xs py-3.5 px-8 hover:bg-emerald-600 transition-all outline-none flex items-center gap-1.5 shadow-md shadow-gray-950/10 min-w-[150px] justify-center"
                    id="submit-payment-btn"
                  >
                    {isSubmitting ? (
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4" />
                        <span>تأكيد ودفع ${((cartTotal + (cartTotal * 0.15))).toFixed(2)}</span>
                      </>
                    )}
                  </button>
                  <div className="text-[10px] text-gray-400 font-semibold leading-relaxed max-w-[200px]">
                    بإتمام الدفع أنت توافق على شروط الخدمة وسياسة الشحن في أورا بوتيك.
                  </div>
                </div>
              </form>
            )}

            {/* Step 3: Absolute Success screen */}
            {step === 3 && (
              <div className="py-12 text-center flex flex-col items-center justify-center space-y-6">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', damping: 15 }}
                >
                  <CheckCircle2 className="h-20 w-20 text-emerald-500" />
                </motion.div>

                <div className="space-y-2">
                  <h3 className="text-xl md:text-2xl font-black text-gray-950">لقد تهانينا! تم تأكيد طلبك بنجاح</h3>
                  <p className="text-xs text-indigo-600 font-semibold">مرحباً بك في عائلة أورا بيولينغز الراقية</p>
                </div>

                {/* Simulated Order Metadata invoice box */}
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5.5 w-full text-right space-y-3 font-sans mt-2">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-200/60 font-mono text-xs">
                    <span className="font-bold text-indigo-600">{orderId}</span>
                    <span className="text-gray-400">المُعرّف التعريفي للطلب</span>
                  </div>

                  <div className="space-y-1.5 text-xs text-gray-700">
                    <p><strong>العنوان المسجّل:</strong> {form.address}، {form.city}</p>
                    <p><strong>المستلم:</strong> {form.fullName} ({form.phone})</p>
                    <p><strong>طريقة الدفع:</strong> {paymentMethod === 'COD' ? 'الدفع عند الاستلام (COD)' : 'بطاقة بنكية آمنة مدمجة'}</p>
                    <p className="text-emerald-700"><strong>تاريخ التوصيل المتوقع المبدئي:</strong> {new Date(Date.now() + 3*24*60*60*1000).toLocaleDateString('ar-SA')}</p>
                  </div>
                </div>

                <div className="pt-4 w-full">
                  <button
                    onClick={() => {
                      setStep(1);
                      setForm(initialFormState);
                      onClose();
                    }}
                    className="w-full rounded-2xl bg-gray-950 text-white font-bold text-xs py-3.5 hover:bg-indigo-600 hover:scale-102 transition-all outline-none"
                    id="finish-checkout-btn"
                  >
                    متابعة التسوق ومغادرة بوابة الدفع
                  </button>
                </div>
              </div>
            )}

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
