import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, Sparkles, AlertCircle, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../context/CartContext';
import { PRODUCTS } from '../data/products';

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
}

const DEFAULT_PROMPTS = [
  'ما هي أفضل الملبوسات والسترات الفاخرة المتاحة؟ ✨',
  'أريد هدية مميزة بميزانية لا تتجاوز 100$ 🎁',
  'هل تتوفر لديكم سماعات لاسلكية احترافية؟ 🎧',
  'اقترح عليّ قطعة حلي أو إكسسوار فخم 💍',
];

export default function AIChatbot() {
  const { addToCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      content: 'مرحباً بك في أورا بوتيك (AURA BOUTIQUE). أنا مساعدك الشخصي الذكي لتجربة تسوق لا تفوت. كيف يمكنني إرشادك اليوم لاكتشاف أجمل التشكيلات الفاخرة المناسبة لذوقك الرفيع؟',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  
  const feedEndRef = useRef<HTMLDivElement>(null);

  // Smooth scroll down to new active messages
  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessageToAPI = async (userText: string) => {
    if (!userText.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setErrorStatus(null);

    // Prepare full dialogue compilation
    const updatedMessages = [...messages, userMessage].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const resp = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!resp.ok) {
        throw new Error('فشلت عملية التجاوب مع خادم الذكاء الاصطناعي.');
      }

      const data = await resp.json();
      
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        role: 'model',
        content: data.reply || 'عذراً، لم أتمكن من الحصول على إجابة واضحة.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      console.error(err);
      setErrorStatus('عذراً، الخادم الذكي غير مستجيب حالياً. يرجى التأكد من تشغيل الخادم وتوفير مفتاح API.');
    } finally {
      setIsLoading(false);
    }
  };

  // Check if chatbot response references any specific product by name or keyword to render a custom interactive "Add directly to Cart" action element
  const renderInteractiveCardsIfMentioned = (content: string) => {
    const productsInMessage = PRODUCTS.filter((p) => {
      // split words or simple matching to avoid fuzzy issues
      const cleanName = p.name.toLowerCase();
      const cleanContent = content.toLowerCase();
      return cleanContent.includes(cleanName) || 
             cleanContent.includes(p.name.split(' ')[0].toLowerCase()) ||
             (p.category === 'Electronics' && cleanContent.includes('سماعات') && p.id === 1) ||
             (p.category === 'Accessories & Jewelry' && cleanContent.includes('ساعة') && p.id === 2) ||
             (p.category === 'Fashion & Apparel' && cleanContent.includes('معطف') && p.id === 3) ||
             (p.category === 'Home & Living' && cleanContent.includes('كوب') && p.id === 4);
    });

    if (productsInMessage.length === 0) return null;

    return (
      <div className="mt-3.5 pt-3 border-t border-gray-100/50 space-y-2.5">
        <p className="text-[10px] font-bold text-gray-400">المنتجات المرتبطة المعروضة:</p>
        <div className="grid grid-cols-1 gap-2">
          {productsInMessage.slice(0, 2).map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-3 p-2 rounded-xl bg-gray-50/50 border border-gray-100/30">
              <div className="flex items-center gap-2 text-right">
                <img src={p.image} alt={p.name} className="h-9 w-9 rounded-lg object-cover" />
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-gray-900 truncate max-w-[130px]">{p.name}</p>
                  <p className="text-[10px] text-indigo-600 font-mono font-bold">${p.price.toFixed(2)}</p>
                </div>
              </div>
              <button
                onClick={() => addToCart(p, 1)}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-gray-950 px-2 w-24 py-1.5 text-[10px] font-bold text-white hover:bg-indigo-600 transition-colors"
                id={`bot-quick-add-${p.id}`}
              >
                <ShoppingCart className="h-3 w-3" />
                <span>إضافة سريعة</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <AnimatePresence>
        {/* Chat Window Panel */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: 'spring', damping: 24, stiffness: 220 }}
            className="mb-4 h-[550px] w-[360px] sm:w-[380px] rounded-3xl border border-gray-100 bg-white/95 backdrop-blur-xl shadow-2xl flex flex-col overflow-hidden"
            id="ai-chatbot-dialogue-window"
          >
            {/* Window Header */}
            <div className="bg-gray-950 p-4.5 text-white flex items-center justify-between">
              <button
                onClick={() => setIsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all outline-none"
              >
                <X className="h-4.5 w-4.5" />
              </button>

              <div className="flex items-center gap-2.5 text-right">
                <div>
                  <h4 className="text-xs font-black tracking-wide">مُستشار أورا الذكي</h4>
                  <p className="text-[9px] text-gray-400 font-medium">مساعد التسوق الشخصي الفاخر</p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-indigo-400">
                  <Bot className="h-5 w-5 animate-pulse" />
                </div>
              </div>
            </div>

            {/* Micro warning indicator if error occurs */}
            {errorStatus && (
              <div className="bg-rose-50 p-3 text-rose-800 text-xs text-right border-b border-rose-100 flex items-center gap-2.5">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
                <p className="flex-1 font-semibold leading-relaxed">{errorStatus}</p>
              </div>
            )}

            {/* Conversation Messages Stream Scroll container */}
            <div className="flex-1 overflow-y-auto p-4.5 space-y-4 bg-radial from-gray-50/30 to-white/10">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'} gap-2.5 text-right`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-tl-none font-semibold shadow-md shadow-indigo-600/10'
                        : 'bg-white text-gray-950 rounded-tr-none border border-gray-100 shadow-sm'
                    }`}
                  >
                    <p className="font-sans whitespace-pre-line">{m.content}</p>
                    
                    {/* Inject custom visual product recommendation box if match is found */}
                    {m.role === 'model' && renderInteractiveCardsIfMentioned(m.content)}

                    <span className={`block text-[9px] mt-1.5 ${m.role === 'user' ? 'text-indigo-200' : 'text-gray-400'} font-mono`}>
                      {m.timestamp.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  {m.role === 'model' && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-50 border border-gray-100 text-indigo-600 mt-1">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}

              {/* Waiting typing status loader */}
              {isLoading && (
                <div className="flex justify-end gap-2.5 text-right">
                  <div className="rounded-2xl p-3.5 bg-gray-50 border border-gray-100 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="h-2 w-2 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="h-2 w-2 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-50 border border-gray-100 text-indigo-600 mt-1">
                    <Bot className="h-4 w-4" />
                  </div>
                </div>
              )}
              
              <div ref={feedEndRef} />
            </div>

            {/* Quick Prompts List (Scroll horizontally / wrap gracefully) */}
            {messages.length === 1 && (
              <div className="px-4.5 py-2.5 border-t border-gray-50 bg-gray-50/50">
                <p className="text-[10px] font-bold text-gray-400 mb-2 text-right flex items-center justify-end gap-1">
                  <span>أسئلة شائعة لبدء المحادثة</span>
                  <Sparkles className="h-3 w-3 text-amber-500" />
                </p>
                <div className="flex flex-col gap-1.5">
                  {DEFAULT_PROMPTS.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => sendMessageToAPI(p)}
                      className="text-right text-[11px] font-semibold text-gray-700 bg-white hover:bg-indigo-50 hover:text-indigo-600 border border-gray-100 rounded-xl px-3 py-2 transition-colors duration-200 outline-none truncate"
                      id={`chatbot-quick-prompt-${idx}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input message form controls */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessageToAPI(input);
              }}
              className="p-4.5 border-t border-gray-100 bg-white flex items-center gap-2"
            >
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-950 text-white disabled:bg-gray-100 disabled:text-gray-400 hover:bg-indigo-600 transition-all outline-none"
                id="chatbot-send-btn"
              >
                <Send className="h-4.5 w-4.5 rotate-180" />
              </button>
              
              <input
                type="text"
                placeholder="اسأل مستشار أورا عن منتج..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2 text-xs outline-none focus:border-gray-900 focus:bg-white direction-rtl"
                id="chatbot-input-field"
              />
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Circular Action Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-950 text-white shadow-2xl hover:bg-indigo-600 transition-all focus:outline-none relative group"
        id="ai-chatbot-toggle-trigger"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close-icon"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="h-5.5 w-5.5" />
            </motion.div>
          ) : (
            <motion.div
              key="chat-icon"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="relative"
            >
              <MessageSquare className="h-5.5 w-5.5" />
              {/* Floating micro notification badge */}
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 rounded-full bg-indigo-400" />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Floating human hover label tooltip */}
        <span className="absolute right-14 scale-0 group-hover:scale-100 transition-transform origin-right bg-gray-900 font-bold text-white text-[10px] py-1 px-3.5 rounded-xl whitespace-nowrap shadow-md shadow-gray-900/10">
          مستشارك الذكي في الخدمة
        </span>
      </motion.button>
    </div>
  );
}
