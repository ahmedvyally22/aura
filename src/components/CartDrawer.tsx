import React from 'react';
import { X, Trash2, ArrowLeft, ShoppingBag, Plus, Minus, CreditCard, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'motion/react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export default function CartDrawer({ isOpen, onClose, onCheckout }: CartDrawerProps) {
  const { cart, removeFromCart, updateQuantity, cartCount, cartTotal } = useCart();

  const FREE_SHIPPING_THRESHOLD = 150;
  const dispatchToFreeShipping = Math.max(FREE_SHIPPING_THRESHOLD - cartTotal, 0);
  const freeShippingPercentage = Math.min((cartTotal / FREE_SHIPPING_THRESHOLD) * 100, 100);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop glass blur layout */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-gray-950/40 backdrop-blur-xs"
        />

        <div className="absolute inset-y-0 right-0 flex max-w-full pl-0 sm:pl-10">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 240 }}
            className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full"
            id="cart-drawer-container"
          >
            {/* Header section panel */}
            <div className="px-5 py-4.5 border-b border-gray-100 flex items-center justify-between">
              <button
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-50 text-gray-500 hover:bg-gray-950 hover:text-white transition-all outline-none"
                id="cart-close-trigger"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-2 text-right">
                <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full font-mono">
                  {cartCount}
                </span>
                <h2 className="text-base font-black text-gray-950">سلة المشتريات</h2>
              </div>
            </div>

            {/* Middle Product items listings scroll viewport */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cart.length > 0 ? (
                <>
                  {/* Progressive indicator for free shipping rewards */}
                  <div className="rounded-2xl border border-indigo-100 bg-indigo-50/20 p-4 text-right">
                    <div className="flex items-center gap-1.5 justify-end text-xs font-bold text-indigo-950">
                      {dispatchToFreeShipping > 0 ? (
                        <>
                          <span>أضف <strong className="text-indigo-600 font-mono">${dispatchToFreeShipping.toFixed(2)}</strong> لطلبك واحصل على شحن مجاني!</span>
                          <Sparkles className="h-4 w-4 text-indigo-600" />
                        </>
                      ) : (
                        <>
                          <span className="text-emerald-700">مبروك! طلبك مؤهل الآن للشحن المجاني السريع</span>
                          <Sparkles className="h-4 w-4 text-emerald-600 animate-spin-slow" />
                        </>
                      )}
                    </div>
                    {/* Linear slider meter bar */}
                    <div className="mt-2.5 h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 transition-all duration-300"
                        style={{ width: `${freeShippingPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Complete detailed lists */}
                  <div className="divide-y divide-gray-100">
                    {cart.map((item) => (
                      <div key={item.product.id} className="flex gap-4 py-4 first:pt-0 last:pb-0 text-right">
                        {/* Remove Action Trash */}
                        <div className="flex flex-col justify-between items-start">
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-xl text-gray-400 hover:bg-rose-50 hover:text-rose-500 transition-colors"
                            id={`remove-cart-item-${item.product.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Middle detailed descriptor text */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 truncate">
                              {item.product.name}
                            </h4>
                            <p className="text-[10px] text-gray-400 mt-0.5">{item.product.category}</p>
                          </div>

                          <div className="flex items-center justify-between mt-3">
                            <span className="text-sm font-bold text-gray-950 font-mono">
                              ${(item.product.price * item.quantity).toFixed(2)}
                            </span>
                            
                            {/* Quantity controls */}
                            <div className="flex items-center rounded-xl border border-gray-100 bg-gray-50 p-1">
                              <button
                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                className="flex h-6 w-6 items-center justify-center rounded-lg bg-white shadow-sm hover:bg-gray-950 hover:text-white"
                                disabled={item.quantity >= item.product.stock}
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                              <span className="w-8 text-center text-xs font-bold font-mono">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                className="flex h-6 w-6 items-center justify-center rounded-lg bg-white shadow-sm hover:bg-gray-950 hover:text-white"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Floating item thumbnail */}
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="h-20 w-20 rounded-xl object-cover border border-gray-100 bg-gray-50"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                /* Dynamic elegant empty cart layout */
                <div className="py-24 text-center flex flex-col items-center justify-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-5">
                    <ShoppingBag className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-bold text-gray-800">سلتك لا تزال فارغة</h3>
                  <p className="text-xs text-gray-400 mt-1 max-w-xs px-4">
                    تصفّح منتجات أورا المتفرّدة والمميّزة اليوم وأضف احتياجاتك هنا لتبدأ رحلتك الرائعة.
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-6 rounded-full bg-gray-900 py-2.5 px-6 text-xs font-bold text-white hover:bg-indigo-600 transition-all outline-none"
                    id="cart-drawer-shopping-explore"
                  >
                    استكشف المنتجات الآن
                  </button>
                </div>
              )}
            </div>

            {/* Bottom calculation and Checkout triggers */}
            {cart.length > 0 && (
              <div className="border-t border-gray-100 p-5 bg-gray-50/50 space-y-4">
                <div className="space-y-2 text-right">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span className="font-mono">${(0.0).toFixed(2)}</span>
                    <span>رسوم الشحن والتوصيل</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span className="font-mono">${(cartTotal * 0.15).toFixed(2)}</span>
                    <span>ضريبة القيمة المضافة (15%)</span>
                  </div>
                  <div className="flex justify-between items-end pt-2 border-t border-gray-100">
                    <span className="text-lg font-black text-indigo-600 font-mono">
                      ${(cartTotal + (cartTotal * 0.15)).toFixed(2)}
                    </span>
                    <span className="text-sm font-extrabold text-gray-950">إجمالي الطلب النهائي</span>
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    onClick={onCheckout}
                    className="flex-1 flex h-12 items-center justify-center gap-2 rounded-2xl bg-gray-950 text-white text-xs font-bold hover:bg-indigo-600 hover:scale-102 transition-all outline-none shadow-md"
                    id="cart-drawer-checkout-btn"
                  >
                    <CreditCard className="h-4 w-4" />
                    <span>إتمام الطلب والدفع الآمن</span>
                  </button>
                </div>
              </div>
            )}

          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
