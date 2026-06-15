import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Validation
    if (!email || !password || (isSignUp && !name)) {
      setErrorMsg('يرجى ملء جميع الحقول المطلوبة.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.');
      return;
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        await signUpWithEmail(email, name, password);
        setSuccessMsg('تم إنشاء حسابك بنجاح! أهلاً بك في بوتيك أورا.');
        setTimeout(() => {
          onClose();
          // Reset form fields
          setEmail('');
          setPassword('');
          setName('');
          setSuccessMsg(null);
        }, 1800);
      } else {
        await signInWithEmail(email, password);
        setSuccessMsg('تم تسجيل دخولك بنجاح. تسوق ممتع!');
        setTimeout(() => {
          onClose();
          setEmail('');
          setPassword('');
          setSuccessMsg(null);
        }, 1500);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setErrorMsg('البريد الإلكتروني أو كلمة المرور غير صحيحة.');
      } else if (err.code === 'auth/email-already-in-use') {
        setErrorMsg('هذا البريد الإلكتروني مسجل بالفعل لصالح مستخدم آخر.');
      } else {
        setErrorMsg(err.message || 'حدث خطأ غير متوقع أثناء التصديق.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] overflow-y-auto bg-black/70 p-4 flex justify-center items-start">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 cursor-pointer"
        />

        {/* Modal Window Container - Avoids top clipping, implements custom layout settings with smart auto-scroll */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          className="relative w-full max-w-md my-auto md:mt-16 rounded-3xl bg-white p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-gray-100 z-10"
          id="auth-modal-dialog-panel"
        >
          {/* Header Theme Card */}
          <button
            onClick={onClose}
            className="absolute left-6 top-6 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all outline-none z-20"
            id="auth-modal-close-btn"
          >
            <X className="h-4.5 w-4.5" />
          </button>
          
          {/* Scrollable Container Content Panel */}
          <div className="overflow-y-auto pr-1 flex-1 max-h-[75vh] text-right">
            <div className="mb-6 mt-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-indigo-700">
                <Sparkles className="h-3 w-3 animate-pulse" />
                <span>أورا بريفيه (Aura Privé)</span>
              </span>
              <h3 className="mt-3 text-2xl font-black tracking-tight text-gray-900">
                {isSignUp ? 'انضم إلى نخبة أورا بوتيك' : 'مرحباً بعودتك زبوننا العزيز'}
              </h3>
              <p className="mt-1.5 text-xs text-gray-500 leading-relaxed">
                {isSignUp 
                  ? 'أنشئ حساباً مجانياً للوصول الحصري لأحدث تشكيلاتنا ومتابعة طلباتك.'
                  : 'سجل دخولك لتجربة تسوق مكملة بالكامل وحفظ طلباتك بدقه في سيرفراتنا.'}
              </p>
            </div>

            {/* Form Content body */}
            <form onSubmit={handleSubmit} className="space-y-4">
            {/* Success popup feedback */}
            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 rounded-2xl bg-emerald-50 p-4 text-xs font-bold text-emerald-800 text-right direction-rtl"
              >
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 ml-1.5" />
                <p>{successMsg}</p>
              </motion.div>
            )}

            {/* Error popup feedback */}
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 rounded-2xl bg-rose-50 p-4 text-xs font-bold text-rose-800 text-right direction-rtl"
              >
                <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 ml-1.5" />
                <p>{errorMsg}</p>
              </motion.div>
            )}

            {/* Sub fields */}
            <div className="space-y-3.5">
              {/* Name Field (Sign up only) */}
              {isSignUp && (
                <div>
                  <label className="block text-right text-[11px] font-bold text-gray-500 mb-1.5">الأسم الكامل</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="أوّل اسم واللقب"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={isLoading}
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pr-4 pl-10 text-xs outline-none focus:border-gray-900 focus:bg-white text-right direction-rtl transition-colors"
                      id="auth-name-input"
                    />
                    <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
              )}

              {/* Email address field */}
              <div>
                <label className="block text-right text-[11px] font-bold text-gray-500 mb-1.5">البريد الإلكتروني</label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pr-4 pl-10 text-xs outline-none focus:border-gray-900 focus:bg-white text-right direction-rtl transition-colors"
                    id="auth-email-input"
                  />
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {/* Secure Password field */}
              <div>
                <label className="block text-right text-[11px] font-bold text-gray-500 mb-1.5">كلمة المرور</label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="●●●●●●"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pr-4 pl-10 text-xs outline-none focus:border-gray-900 focus:bg-white text-right direction-rtl transition-colors"
                    id="auth-password-input"
                  />
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-2 space-y-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-2xl bg-gray-950 py-3 text-xs font-bold text-white hover:bg-indigo-600 transition-colors shadow-lg active:scale-98 disabled:bg-gray-400 flex items-center justify-center gap-2 cursor-pointer"
                id="auth-submit-btn"
              >
                {isLoading ? (
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-bounce" />
                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                ) : (
                  <span>{isSignUp ? 'إنشاء حساب جديد' : 'الدخول للبوتيك'}</span>
                )}
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-gray-150"></div>
                <span className="flex-shrink mx-3 text-[10px] text-gray-400 font-bold">أو من خلال</span>
                <div className="flex-grow border-t border-gray-150"></div>
              </div>

              <button
                type="button"
                disabled={isLoading}
                onClick={async () => {
                  setErrorMsg(null);
                  setSuccessMsg(null);
                  setIsLoading(true);
                  try {
                    await signInWithGoogle();
                    setSuccessMsg('تم تسجيل دخولك بنجاح عبر حساب Google!');
                    setTimeout(() => {
                      onClose();
                      setSuccessMsg(null);
                    }, 1200);
                  } catch (err: any) {
                    console.error("Google Auth error:", err);
                    setErrorMsg(err.message || 'فشل تسجيل الدخول بواسطة Google.');
                  } finally {
                    setIsLoading(false);
                  }
                }}
                className="w-full rounded-2xl border border-gray-200 bg-white py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                id="auth-google-btn"
              >
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6-4.53z"
                  />
                </svg>
                <span>تسجيل دخول سريع بـ Google</span>
              </button>

              <div className="bg-indigo-50/50 rounded-xl p-3 text-right">
                <p className="text-[10px] text-indigo-700 leading-normal font-medium">
                  💡 تلميح: في حال حدوث خطأ عند استخدام البريد الإلكتروني العادي، يرجى الاستمرار بالتسجيل السريع عبر Google، أو تفعيل <span className="font-bold">Email/Password sign-in provider</span> من لوحة تحكم Firebase وتحديثها.
                </p>
              </div>
            </div>

            {/* Switching Tab trigger links */}
            <div className="pt-3 border-t border-gray-100 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setErrorMsg(null);
                }}
                className="text-[11px] font-bold text-gray-400 hover:text-indigo-600 transition-colors"
                id="auth-switch-tab-btn"
              >
                {isSignUp 
                  ? 'تمتلك حساباً بالفعل؟ سجل دخولك بدلاً من ذلك' 
                  : 'ليس لديك حساب مسبق؟ أنشئ حساباً فوراً في ثوانٍ'}
              </button>
            </div>
          </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
