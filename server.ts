import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { PRODUCTS } from './src/data/products';

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware for parsing JSON
app.use(express.json());

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// AI Chatbot endpoint
app.post('/api/chatbot', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages are required and must be an array' });
    }

    // Standardize contents history
    const contents = messages.map((m: any) => ({
      role: m.role === 'model' || m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content || m.text || '' }]
    }));

    // Generate System Instructions including current product listings
    const productsContext = PRODUCTS.map(p => (
      `- ID: ${p.id}\n  الأسم: ${p.name}\n  الفئة: ${p.category}\n  السعر: $${p.price}\n  الوصف: ${p.description}\n  التقييم: ${p.rating.rate} (بناءً على ${p.rating.count} عميل)\n  المخزون المتوفر: ${p.stock}`
    )).join('\n\n');

    const systemInstruction = `
أنت المساعد الذكي والمتخصص الشخصي لتسوق متجر "أورا بوتيك" (AURA BOUTIQUE) الفاخر.
أهدافك كمعلّم مبيعات راقٍ ومضياف:
1. الترحيب بزبائن بوتيك أورا بأقصى درجات اللباقة والترحيب الكلاسيكي الفخم.
2. مساعدة العملاء في اختيار واكتشاف المنتجات المناسبة لاحتياجاتهم، ميزانيتهم، وأعمارهم وأذواقهم بناءً على قائمة منتجاتنا فقط.
3. تفادي اختلاق أي منتجات وهمية خارج نطاق مخزون أورا بوتيك. وإذا سأل العميل عن منتج غير متوفر، اقترح عليه البدائل المتوفرة لدينا بلطف شديد.
4. اذكر دائماً الأسعار بدقة بالدولار الأمريكي ($) واستعرض فوائد المنتجات المميزة المتاحة لدينا.
5. تحدّث مع الزبون بلغة مريحة ترحيبية مهذبة للغاية (يفضل استخدام اللغة العربية الفصحى الأنيقة أو اللهجة التي يرتاح لها ومستعد لخدمة العملاء بالإنجليزية إذا تطلب الأمر).

هنا قائمة منتجات أورا بوتيك الحالية المتاحة للبيع والطلب الفوري:
${productsContext}
    `;

    // Query generative model
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    const reply = response.text || 'عذراً، لم أستطع معالجة طلبك حالياً. كيف يمكنني مساعدتك بطريقة أخرى في أورا؟';
    
    return res.json({ reply });
  } catch (error: any) {
    console.error('Error in chatbot API:', error);
    return res.status(500).json({ 
      error: 'حدث خطأ أثناء معالجة طلبك في الذكاء الاصطناعي الخاص بالبوتيك.',
      details: error?.message || String(error)
    });
  }
});

// Admin AI Business Analysis endpoint
app.post('/api/admin/ai-analysis', async (req, res) => {
  try {
    const { orders, products, stats } = req.body;

    const prompt = `
أنت كبير المستشارين الاستراتيجيين ومحلل البيانات المالي للأعمال لبوتيك "أورا" (AURA BOUTIQUE) الفاخر.
لديك البيانات التاريخية ومعاملات البيع الفعلي بالمتجر حالياً للتحليل:

1. الإحصائيات العامة:
- إجمالي المبيعات المحققة بالمتجر: $${stats?.totalSales || 0}
- إجمالي عدد الطلبات: ${stats?.ordersCount || 0}
- إجمالي منتجات الكتالوج: ${products?.length || 0}

2. تفاصيل الطلبات الأخيرة:
${(orders || []).slice(0, 15).map((o: any) => `- طلب رقم: ${o.id}، العميل: ${o.customerName} (${o.userEmail})، المجموع الإجمالي: $${o.total}، المنتجات: ${o.items?.map((i: any) => `${i.productName} (الكمية: ${i.quantity})`).join(', ')}`).join('\n')}

3. تشكيلة المنتجات والمخزون الحالي:
${(products || []).map((p: any) => `- ${p.name} (الفئة: ${p.category}، السعر: $${p.price}، المخزون المتبقي: ${p.stock}، التقييم: ${p.rating?.rate})`).join('\n')}

قم بصياغة تقرير إداري استثماري فائق الفخامة والروعة بلغة عربية فصحى راقية ومحترفة جداً (Business-Grade Arabic) باستخدام تنسيق Markdown شامل وجذاب يتضمن:
- 📊 **تحليل عميق لأداء المبيعات وسلوك العملاء الشرائي**: ما هي الأنماط الأكثر تكراراً وكيف تساهم في إيرادات المتجر.
- 🏆 **المنتجات النجمية والفرص المستقبلية**: تحديد السلع الأكثر تميزاً وطلباً، وتوقع فئات المنتجات التي يُنصح بالتوسع فيها.
- 💡 **توصيات تنموية وتسويقية استراتيجية مخصصة**: مقترحات عملية ومبتكرة لزيادة معدل حجز السلة ومتوسط قيمة الطلب الفردي الفاخر بـ أورا.
- 📦 **حلول ذكية لإدارة المخزون**: توصيات لمواجهة نقص المنتجات أو تفادي الركود.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        temperature: 0.6,
      }
    });

    const report = response.text || 'عذراً، لم نتمكن من صياغة تقرير التحليل حالياً. يرجى إعادة المحاولة من جديد.';
    return res.json({ report });
  } catch (error: any) {
    console.error('Error in AI analysis API:', error);
    return res.status(500).json({ 
      error: 'حدث خطأ غير متوقع أثناء توليد التحليل الذكي للبوتيك.',
      details: error?.message || String(error)
    });
  }
});

// Setup Vite Dev server or Serve static files
async function setupServer() {
  // Direct return under Vercel Serverless environment where frontend routes and static files are served natively by Vercel
  if (process.env.VERCEL) {
    return;
  }

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running beautifully on http://0.0.0.0:${PORT}`);
  });
}

setupServer();

export default app;
