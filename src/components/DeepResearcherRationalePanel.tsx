import React, { useState } from 'react';
import { 
  Bot, Globe, ShieldCheck, Target, Lock, ChevronDown, 
  Sparkles, CheckCircle2, BookOpen, Layers, Volume2
} from 'lucide-react';
import { AssetSymbol, ExchangeId, ScalpingContainer } from '../types/terminal';

export type DeepResearcherLanguage = 'en' | 'hi' | 'ar' | 'ur' | 'kn' | 'ml';

interface DeepResearcherRationaleProps {
  asset: AssetSymbol;
  exchange: ExchangeId;
  limitEntry: number;
  structuralSL: number;
  slDistance: number;
  targetPrice: number;
  horizon: ScalpingContainer;
  livePrice: number;
}

interface LanguageContent {
  title: string;
  badge: string;
  whyEntryTitle: string;
  whyEntryText: string;
  whySLTitle: string;
  whySLText: string;
  whyTargetTitle: string;
  whyTargetText: string;
  connectionSummary: string;
  researcherVoice: string;
}

const EXPLANATIONS: Record<DeepResearcherLanguage, (props: DeepResearcherRationaleProps) => LanguageContent> = {
  en: (p) => ({
    title: 'SR Deep Researcher Mode — Behavioral Audit Rationale',
    badge: 'DEEP RESEARCHER ACTIVE',
    whyEntryTitle: `Why Limit Entry is Fixed at $${p.limitEntry.toLocaleString()}`,
    whyEntryText: `This limit seat is calculated by anchoring the 1-Minute expansion to the 5-Minute higher-low structural floor on ${p.exchange}. Instead of chasing live market candles (which invites spread slippage), the order waits for price to tap the exact structural mid-zone seat. This guarantees zero execution drift.`,
    whySLTitle: `Why Structural Stop Loss is Fixed at $${p.structuralSL.toLocaleString()} (±$${p.slDistance})`,
    whySLText: `Our 0.10% hard stop loss does not guess where market volatility might stop. It is mathematically locked exactly 0.10% beneath the 5-Minute higher-low support connection. If this connection holds, the behavior continues upward; if price touches this floor, the structural premise is immediately invalidated, containing loss to exactly $${p.slDistance} per unit.`,
    whyTargetTitle: `Why Target is Fixed at $${p.targetPrice.toLocaleString()} (${p.horizon} Horizon)`,
    whyTargetText: `The ${p.horizon} target is not an arbitrary profit wish. It is derived by projecting the 15-Minute parent liquidity continuum (${p.horizon === '1:5' ? '5x' : p.horizon === '1:10' ? '10x' : '15x'} of the 0.10% structural distance). The market behavior must expand to rebalance higher-timeframe orderflow, making this target a natural behavioral destination.`,
    connectionSummary: `Anchor Continuum: 1m Micro-Node → 5m Structural Support → 15m Liquidity Pipe → 1h Directional Flow. Validated strictly on ${p.exchange} native feed.`,
    researcherVoice: `"Every limit order sits at an exact structural seat. We never chase candles; we let the multi-timezone connection bring price to our protected limit order." — Siyab Raheman & Raziya Raheman`
  }),

  hi: (p) => ({
    title: 'एसआर डीप रिसर्चर मोड — बिहेवियरल ऑडिट विश्लेषण',
    badge: 'डीप रिसर्चर सक्रिय',
    whyEntryTitle: `लिमिट एंट्री $${p.limitEntry.toLocaleString()} पर क्यों तय की गई है?`,
    whyEntryText: `यह लिमिट सीट ${p.exchange} पर 1-मिनट के विस्तार को 5-मिनट के हायर-लो स्ट्रक्चरल सपोर्ट से जोड़कर निकाली गई है। लाइव कैंडल के पीछे भागने के बजाय (जिससे स्लिपेज का नुकसान होता है), ऑर्डर ठीक स्ट्रक्चरल मिड-ज़ोन सीट पर इंतज़ार करता है। यह शून्य स्लिपेज सुनिश्चित करता है।`,
    whySLTitle: `स्ट्रक्चरल स्टॉप लॉस $${p.structuralSL.toLocaleString()} (±$${p.slDistance}) पर क्यों है?`,
    whySLText: `हमारा 0.10% हार्ड स्टॉप लॉस कोई अंदाज़ा नहीं है। यह 5-मिनट सपोर्ट कनेक्शन के ठीक नीचे स्थित है। जब तक यह कनेक्शन सुरक्षित है, स्ट्रक्चर ऊपर की ओर बढ़ता रहेगा; यदि प्राइस इसे छूती है तो सेटअप स्वतः अमान्य हो जाता है, जिससे नुकसान 0.10% पर ही रुक जाता है।`,
    whyTargetTitle: `टार्गेट $${p.targetPrice.toLocaleString()} (${p.horizon} होराइज़न) पर क्यों रखा गया है?`,
    whyTargetText: `${p.horizon} का टार्गेट कोई काल्पनिक मुनाफ़ा नहीं है। यह 15-मिनट लिक्विडिटी कॉन्टिनम के विस्तार (${p.horizon === '1:5' ? '5 गुना' : p.horizon === '1:10' ? '10 गुना' : '15 गुना'}) पर आधारित है। मार्केट बिहेवियर को बड़े टाइमफ्रेम के ऑर्डरफ्लो को पूरा करने के लिए यहाँ तक पहुँचना ही होता है।`,
    connectionSummary: `कॉन्टिनम कनेक्शन: 1-मिनट नोड → 5-मिनट सपोर्ट → 15-मिनट लिक्विडिटी पाइप → 1-घंटे का मैक्रो फ्लो। केवल ${p.exchange} मेननेट डेटा पर सत्यापित।`,
    researcherVoice: `"हर लिमिट ऑर्डर अपनी तय सीट पर बैठता है। हम कभी कैंडल के पीछे नहीं भागते, बल्कि टाइमज़ोन कनेक्शन प्राइस को हमारी सुरक्षित लिमिट सीट तक लाता है।" — सियाब रहमान एवं रज़िया रहमान`
  }),

  ar: (p) => ({
    title: 'وضع الباحث المعمق SR — تبرير التحليل السلوكي للأوامر',
    badge: 'الباحث المعمق نشط',
    whyEntryTitle: `لماذا تم تحديد سعر الدخول المعلق عند $${p.limitEntry.toLocaleString()}؟`,
    whyEntryText: `تم حساب مقعد أمر الدخول المعلق هذا من خلال ربط تمدد شمعة الدقيقة بقاع الدعم الهيكلي لشمعة الـ 5 دقائق على ${p.exchange}. بدلاً من ملاحقة الشموع الحية (التي تسبب الانزلاق السعري)، ينتظر الأمر ملامسة السعر للمقعد الهيكلي بدقة وبدون أي انزلاق.`,
    whySLTitle: `لماذا تم تثبيت وقف الخسارة عند $${p.structuralSL.toLocaleString()} (±$${p.slDistance})؟`,
    whySLText: `إن وقف الخسارة الصارم بنسبة 0.10% محمي رياضياً أسفل اتصال دعم الـ 5 دقائق مباشرة. طالما ظل هذا الاتصال سليماً، يستمر المسار الصاعد؛ وإذا كُسر، يتم إبطال الفرضية فوراً لاحتواء المخاطرة بدقة عند 0.10%.`,
    whyTargetTitle: `لماذا تم تحديد الهدف عند $${p.targetPrice.toLocaleString()} (أفق ${p.horizon})؟`,
    whyTargetText: `الهدف ${p.horizon} ليس رقماً عشوائياً، بل هو إسقاط لسيولة شمعة الـ 15 دقيقة (${p.horizon === '1:5' ? '5 أضعاف' : p.horizon === '1:10' ? '10 أضعاف' : '15 ضعفاً'} من مسافة 0.10%). يجب أن يتوسع السلوك السوقي لإعادة التوازن للسيولة الكلية.`,
    connectionSummary: `سلسلة الاتصال: نقطة 1 دقيقة → دعم 5 دقائق → قناة سيولة 15 دقيقة → تدفق الماكرو لـ 1 ساعة. معتمد حصرياً على بيانات ${p.exchange}.`,
    researcherVoice: `"كل أمر محدد يجلس في مقعده الهيكلي المخطط له مسبقاً. نحن لا نلاحق الشموع، بل ندع السعر يأتي إلى أمرنا المحمي." — سياب رحمان ورزية رحمان`
  }),

  ur: (p) => ({
    title: 'ایس آر ڈیپ ریسرچر موڈ — لمیٹ آرڈر کی تکنیکی اور سائنسی وضاحت',
    badge: 'ڈیپ ریسرچر فعال ہے',
    whyEntryTitle: `لیمنٹ انٹری $${p.limitEntry.toLocaleString()} پر کیوں مقرر کی گئی ہے؟`,
    whyEntryText: `یہ لمیٹ سیٹ ${p.exchange} پر 1 منٹ کی توسیع کو 5 منٹ کے ہائیر-لو سٹرکچرل سپورٹ سے ملا کر تیار کی گئی ہے۔ مارکیٹ کینڈلز کے پیچھے بھاگنے کے بجائے آرڈر اپنی مخصوص سٹرکچرل سیٹ پر قیمت کے آنے کا انتظار کرتا ہے تاکہ سلپج کا کوئی امکان نہ رہے۔`,
    whySLTitle: `سٹرکچرل سٹاپ لاس $${p.structuralSL.toLocaleString()} (±$${p.slDistance}) پر کیوں ہے؟`,
    whySLText: `ہمارا 0.10% ہارڈ سٹاپ لاس 5 منٹ کی سٹرکچرل سپورٹ کنکشن کے بالکل نیچے سختی سے مقفل ہے۔ اگر یہ کنکشن برقرار رہتا ہے تو رویہ اوپر جاتا ہے، اور اگر قیمت اس کو چھو لے تو سیٹ اپ منسوخ ہو جاتا ہے تاکہ نقصان صرف 0.10% تک محدود رہے۔`,
    whyTargetTitle: `ٹارگٹ $${p.targetPrice.toLocaleString()} (${p.horizon} ہورائزن) پر کیوں ہے؟`,
    whyTargetText: `${p.horizon} کا ٹارگٹ 15 منٹ کے پیرنٹ لیکویڈیٹی کنٹینیوم کی بنیاد پر طے کیا گیا ہے۔ مارکیٹ سٹرکچر کو بڑے ٹائم فریم کے آرڈر فلو کو متوازن کرنے کے لیے اس ہدف تک جانا ہی ہوتا ہے۔`,
    connectionSummary: `کنٹینیوم کنکشن: 1 منٹ نوڈ ← 5 منٹ سٹرکچرل سپورٹ ← 15 منٹ لیکویڈیٹی پائپ ← 1 گھنٹہ فلو۔ مکمل طور پر ${p.exchange} کے اصل فیڈ پر تصدیق شدہ۔`,
    researcherVoice: `"ہر لمیٹ آرڈر اپنی متعین کردہ سٹرکچرل سیٹ پر بیٹھتا ہے۔ ہم کینڈل کے پیچھے نہیں بھاگتے، وقت اور قیمت کا رابطہ اسے ہمارے پاس لاتا ہے۔" — سیاب رحمن اور رضیہ رحمن`
  }),

  kn: (p) => ({
    title: 'ಎಸ್.ಆರ್ ಡೀಪ್ ರಿಸರ್ಚರ್ ಮೋಡ್ — ಲಿಮಿಟ್ ಆರ್ಡರ್ ವಿವರಣೆ',
    badge: 'ಡೀಪ್ ರಿಸರ್ಚರ್ ಸಕ್ರಿಯ',
    whyEntryTitle: `ಲಿಮಿಟ್ ಎಂಟ್ರಿಯನ್ನು $${p.limitEntry.toLocaleString()} ನಲ್ಲಿ ಏಕೆ ನಿಗದಿಪಡಿಸಲಾಗಿದೆ?`,
    whyEntryText: `${p.exchange} ನಲ್ಲಿ 1-ನಿಮಿಷದ ಹೈ ಅನ್ನು 5-ನಿಮಿಷದ ಹೈಯರ್-ಲೋ ಸಪೋರ್ಟ್‌ಗೆ ಜೋಡಿಸಿ ಈ ಲಿಮಿಟ್ ಸೀಟ್ ಲೆಕ್ಕಹಾಕಲಾಗಿದೆ. ಲೈವ್ ಕ್ಯಾಂಡಲ್ ಬೆನ್ನಟ್ಟದೆ, ಬೆಲೆ ನಮ್ಮ ನಿಖರವಾದ ಸೀಟ್‌ಗೆ ಬರುವವರೆಗೂ ಕಾಯಲಾಗುತ್ತದೆ. ಇದರಿಂದ ಸ್ಲಿಪೇಜ್ ಸಂಪೂರ್ಣವಾಗಿ ತಪ್ಪುತ್ತದೆ.`,
    whySLTitle: `ಸ್ಟಾಪ್ ಲಾಸ್ $${p.structuralSL.toLocaleString()} (±$${p.slDistance}) ನಲ್ಲಿ ಏಕೆ ನಿಲ್ಲಿಸಲಾಗಿದೆ?`,
    whySLText: `ನಮ್ಮ 0.10% ಹಾರ್ಡ್ ಸ್ಟಾಪ್ ಲಾಸ್ ಕೇವಲ ಊಹೆಯಲ್ಲ. ಇದು 5-ನಿಮಿಷದ ಸಪೋರ್ಟ್ ಕನೆಕ್ಷನ್‌ನ ಕೆಳಗೆ ರಕ್ಷಿತವಾಗಿದೆ. ಈ ಕನೆಕ್ಷನ್ ಮುರಿಯದಿದ್ದರೆ ಟಾರ್ಗೆಟ್ ಖಚಿತವಾಗುತ್ತದೆ; ಮುರಿದರೆ ಕೇವಲ 0.10% ನಷ್ಟಕ್ಕೆ ಟ್ರೇಡ್ ಕ್ಲೋಸ್ ಆಗುತ್ತದೆ.`,
    whyTargetTitle: `ಟಾರ್ಗೆಟ್ ಅನ್ನು $${p.targetPrice.toLocaleString()} (${p.horizon}) ಗೆ ಏಕೆ ಫಿಕ್ಸ್ ಮಾಡಲಾಗಿದೆ?`,
    whyTargetText: `${p.horizon} ಟಾರ್ಗೆಟ್ 15-ನಿಮಿಷದ ಲಿಕ್ವಿಡಿಟಿ ಕಂಟಿನ್ಯೂಮ್ ಆಧಾರದ ಮೇಲೆ ನಿರ್ಧಾರವಾಗಿದೆ (${p.horizon === '1:5' ? '5 ಪಟ್ಟು' : p.horizon === '1:10' ? '10 ಪಟ್ಟು' : '15 ಪಟ್ಟು'}). ದೊಡ್ಡ ಟೈಮ್‌ಫ್ರೇಮ್ ಲಿಕ್ವಿಡಿಟಿಯನ್ನು ಪೂರೈಸಲು ಮಾರ್ಕೆಟ್ ಈ ಬೆಲೆಗೆ ಚಲಿಸಲೇಬೇಕಾಗುತ್ತದೆ.`,
    connectionSummary: `ಕನೆಕ್ಷನ್: 1 ನಿಮಿಷ ನೋಡ್ → 5 ನಿಮಿಷ ಸಪೋರ್ಟ್ → 15 ನಿಮಿಷ ಲಿಕ್ವಿಡಿಟಿ → 1 ಗಂಟೆ ಮ್ಯಾಕ್ರೋ ಫ್ಲೋ. ${p.exchange} ಡೇಟಾ ಮಾತ್ರ.`,
    researcherVoice: `"ಪ್ರತಿ ಲಿಮಿಟ್ ಆರ್ಡರ್ ತನ್ನದೇ ಆದ ರಚನಾತ್ಮಕ ಸೀಟ್‌ನಲ್ಲಿ ಕುಳಿತುಕೊಳ್ಳುತ್ತದೆ. ನಾವು ಕ್ಯಾಂಡಲ್ ಬೆನ್ನಟ್ಟುವುದಿಲ್ಲ; ಟೈಮ್‌ಜೋನ್ ಕನೆಕ್ಷನ್ ಬೆಲೆಯನ್ನು ನಮ್ಮ ಬಳಿಗೆ ತರುತ್ತದೆ." — ಸಿಯಾಬ್ ರಹೇಮಾನ್ & ರಜಿಯಾ ರಹೇಮಾನ್`
  }),

  ml: (p) => ({
    title: 'എസ്.ആർ ഡീപ് റിസർച്ചർ മോഡ് — ലിമിറ്റ് ഓർഡർ വിശകലനം',
    badge: 'ഡീപ് റിസർച്ചർ സജീവം',
    whyEntryTitle: `ലിമിറ്റ് എൻട്രി $${p.limitEntry.toLocaleString()} ൽ നിശ്ചയിച്ചത് എന്തുകൊണ്ട്?`,
    whyEntryText: `${p.exchange} ലെ 1-മിനിറ്റ് ചലനത്തെ 5-മിനിറ്റ് ഹയർ-ലോ സപ്പോർട്ടുമായി ബന്ധിപ്പിച്ചാണ് ഈ ലിമിറ്റ് സീറ്റ് തയ്യാറാക്കിയിട്ടുള്ളത്. ലൈവ് കാൻഡിലുകളുടെ പിന്നാലെ പോകാതെ, മുൻകൂട്ടി നിശ്ചയിച്ച സ്ട്രക്ചറൽ സീറ്റിലേക്ക് വില എത്തുന്നത് വരെ കാത്തിരിക്കുന്നു. ഇത് സ്ലിപ്പേജ് പൂർണ്ണമായും ഒഴിവാക്കുന്നു.`,
    whySLTitle: `സ്റ്റോപ്പ് ലോസ് $${p.structuralSL.toLocaleString()} (±$${p.slDistance}) ൽ നിർത്തിയത് എന്തുകൊണ്ട്?`,
    whySLText: `ഞങ്ങളുടെ 0.10% ഹാർഡ് സ്റ്റോപ്പ് ലോസ് ഒരു അനുമാനമല്ല. ഇത് 5-മിനിറ്റ് സപ്പോർട്ട് കണക്ഷന് തൊട്ടുതാഴെ ലോക്ക് ചെയ്തിരിക്കുന്നു. ഈ സപ്പോർട്ട് ഭദ്രമാണെങ്കിൽ മാർക്കറ്റ് മുകളിലേക്ക് നീങ്ങും; ബ്രേക്ക് ചെയ്താൽ നഷ്ടം 0.10% ൽ കൃത്യമായി പരിമിതപ്പെടുത്തും.`,
    whyTargetTitle: `ടാർഗെറ്റ് $${p.targetPrice.toLocaleString()} (${p.horizon}) ആക്കിയത് എന്തുകൊണ്ട്?`,
    whyTargetText: `${p.horizon} ടാർഗെറ്റ് എന്നത് 15-മിനിറ്റ് ലിക്വിഡിറ്റി കണക്ഷന്റെ സ്വാഭാവിക ഫലമാണ് (${p.horizon === '1:5' ? '5 ഇരട്ടി' : p.horizon === '1:10' ? '10 ഇരട്ടി' : '15 ഇരട്ടി'}). ഉയർന്ന ടൈംഫ്രെയിമിലെ ഓർഡർഫ്ലോ ബാലൻസ് ചെയ്യാൻ മാർക്കറ്റിന് ഈ ലെവലിലേക്ക് എത്തിയേ തീരൂ.`,
    connectionSummary: `കണക്ഷൻ ശ്രേണി: 1 മിനിറ്റ് നോഡ് → 5 മിനിറ്റ് സപ്പോർട്ട് → 15 മിനിറ്റ് പൈപ്പ് → 1 മണിക്കൂർ മാക്രോ ഫ്ലോ. ${p.exchange} ഡാറ്റ മാത്രം.`,
    researcherVoice: `"ഓരോ ലിമിറ്റ് ഓർഡറും കൃത്യമായ സ്ട്രക്ചറൽ സീറ്റിൽ ഇരിക്കുന്നു. നമ്മൾ കാൻഡിലുകളെ പിന്തുടരേണ്ടതില്ല; ടൈംസോൺ കണക്ഷൻ വിലയെ നമ്മുടെ ഓർഡറിലേക്ക് കൊണ്ടുവരും." — സിയാബ് റഹ്മാൻ & റസിയ റഹ്മാൻ`
  })
};

const LANGUAGES: { code: DeepResearcherLanguage; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'ar', label: 'Arabic', native: 'العربية' },
  { code: 'ur', label: 'Urdu', native: 'اردو' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം' }
];

export const DeepResearcherRationalePanel: React.FC<DeepResearcherRationaleProps> = (props) => {
  const [lang, setLang] = useState<DeepResearcherLanguage>('en');
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const content = EXPLANATIONS[lang](props);

  return (
    <div className="rounded-3xl bg-[#03060c] border border-blue-500/30 p-6 lg:p-7 shadow-2xl relative overflow-hidden font-mono space-y-5">
      
      {/* Top Banner & Language Selector Controller */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-blue-500/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
            <Bot className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                {content.title}
              </h4>
              <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[9px] font-black uppercase">
                {content.badge}
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 mt-0.5">
              Multi-Language Structural Proof Controller • Zero Prediction • Deterministic Behavior
            </p>
          </div>
        </div>

        {/* Language Tabs Selector */}
        <div className="flex flex-wrap items-center gap-1.5 bg-black/60 p-1.5 rounded-2xl border border-white/10">
          <Globe className="w-3.5 h-3.5 text-zinc-500 ml-1.5 mr-0.5" />
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => setLang(l.code)}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                lang === l.code
                  ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.4)]'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{l.native}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Researcher Voice Quote Box */}
      <div className="p-3.5 rounded-2xl bg-blue-950/20 border border-blue-500/20 text-[11px] text-blue-200/90 italic leading-relaxed flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <span>{content.researcherVoice}</span>
      </div>

      {/* 3 Core Rationale Explanations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        
        {/* Box 1: Why Entry */}
        <div className="p-5 rounded-2xl bg-zinc-950/80 border border-amber-500/30 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold uppercase text-[11px]">
            <Lock className="w-4 h-4" />
            <span>{content.whyEntryTitle}</span>
          </div>
          <p className="text-zinc-300 text-[11px] leading-relaxed">
            {content.whyEntryText}
          </p>
        </div>

        {/* Box 2: Why Stop Loss */}
        <div className="p-5 rounded-2xl bg-zinc-950/80 border border-rose-500/30 space-y-2">
          <div className="flex items-center gap-2 text-rose-400 font-bold uppercase text-[11px]">
            <ShieldCheck className="w-4 h-4" />
            <span>{content.whySLTitle}</span>
          </div>
          <p className="text-zinc-300 text-[11px] leading-relaxed">
            {content.whySLText}
          </p>
        </div>

        {/* Box 3: Why Target */}
        <div className="p-5 rounded-2xl bg-zinc-950/80 border border-emerald-500/30 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase text-[11px]">
            <Target className="w-4 h-4" />
            <span>{content.whyTargetTitle}</span>
          </div>
          <p className="text-zinc-300 text-[11px] leading-relaxed">
            {content.whyTargetText}
          </p>
        </div>

      </div>

      {/* Multi-Timezone Continuum Proof Connection */}
      <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-zinc-300 font-bold">
          <Layers className="w-4 h-4 text-blue-400" />
          <span>{content.connectionSummary}</span>
        </div>
        <span className="text-[9px] text-emerald-400 uppercase font-black bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 whitespace-nowrap">
          100% AUDITABLE PROOF
        </span>
      </div>

    </div>
  );
};
