import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { signInWithGoogle } = useAuth();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);
    try {
      await signInWithGoogle();
      setSuccessMsg('تم تسجيل دخولك بنجاح عبر حساب Google! أهلاً بك في عالم أورا.');
      setTimeout(() => {
        onClose();
        setSuccessMsg(null);
      }, 1500);
    } catch (err: any) {
      console.error("Google Auth error:", err);
      setErrorMsg(err.message || 'فشل تسجيل الدخول بواسطة Google. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 !z-[999999] overflow-y-auto bg-black/80 p-4 flex justify-center items-center backdrop-blur-sm">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 cursor-pointer"
        />

        {/* Modal Window Container - Centered, absolute forefront, gorgeous visual branding */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          className="relative w-full max-w-md rounded-3xl bg-white p-7 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-gray-100 z-10 text-center"
          id="auth-modal-dialog-panel"
        >
          {/* Close button with subtle pulse hover */}
          <button
            onClick={onClose}
            className="absolute left-6 top-6 flex h-9 w-9 items-center justify-center rounded-full bg-gray-50 hover:bg-gray-150 text-gray-500 hover:text-gray-900 transition-all outline-none z-20 shadow-sm"
            id="auth-modal-close-btn"
          >
            <X className="h-5 w-5" />
          </button>
          
          {/* Main Visual Logo Frame */}
          <div className="mt-4 mb-6 flex flex-col items-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3.5 py-1 text-[10px] font-black uppercase tracking-wider text-indigo-700 shadow-sm">
              <Sparkles className="h-3 w-3 text-indigo-600 animate-pulse" />
              <span>أورا بريفيه • VIP Access</span>
            </span>
            <h3 className="mt-4 text-2xl font-black tracking-tight text-gray-900 font-sans">
              مرحباً بك في بوتيك أورا الفاخر
            </h3>
            <p className="mt-2.5 text-xs text-gray-500 leading-relaxed max-w-sm">
              المتجر مغلق حالياً للزوار العامين. يرجى تسجيل الدخول السريع والآمن بحساب Google الخاص بك لتصفح ومتابعة مشترياتك الحصرية.
            </p>
          </div>

          {/* Feedback section - Success / Error popups */}
          <div className="my-4 space-y-3">
            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 rounded-2xl bg-emerald-50 p-4 text-xs font-bold text-emerald-800 text-right direction-rtl"
              >
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 ml-1.5" />
                <p className="flex-1">{successMsg}</p>
              </motion.div>
            )}

            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 rounded-2xl bg-rose-50 p-4 text-xs font-bold text-rose-800 text-right direction-rtl"
              >
                <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 ml-1.5" />
                <p className="flex-1">{errorMsg}</p>
              </motion.div>
            )}
          </div>

          {/* Centered Premium Login Button Section */}
          <div className="py-2 flex flex-col items-center justify-center space-y-5">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              disabled={isLoading}
              onClick={handleGoogleSignIn}
              className="w-full rounded-2xl border border-gray-200 bg-white py-3.5 px-5 text-sm font-bold text-gray-800 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/20 hover:shadow-md transition-all flex items-center justify-center gap-3 cursor-pointer shadow-sm relative overflow-hidden"
              id="auth-google-btn"
            >
              {isLoading ? (
                <span className="flex items-center gap-1.5 py-0.5">
                  <span className="h-2 w-2 rounded-full bg-indigo-600 animate-bounce" />
                  <span className="h-2 w-2 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="h-2 w-2 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              ) : (
                <>
                  <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
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
                  <span>تسجيل الدخول السريع بـ Google</span>
                </>
              )}
            </motion.button>

            {/* Bottom Brand Slogan */}
            <div className="pt-2">
              <p className="text-[10px] text-gray-400 font-medium tracking-wide">
                بمتابعة الدخول، فإنك تؤكد انضمامك لقائمة التسوق الفاخرة الخاصة بـ Aura Boutique.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
