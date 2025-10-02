import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Navigation
      'nav.features': 'Features',
      'nav.canvas': 'Visual Canvas',
      'nav.pricing': 'Pricing',
      'nav.demo': 'Demo',
      'nav.signIn': 'Sign In',
      'nav.getStarted': 'Get Started Free',
      
      // Hero section
      'hero.badge': 'AI-Powered Learning Revolution',
      'hero.title': 'Meet EduVoice AI',
      'hero.subtitle': 'The Talking Visual Learning Platform',
      'hero.description': 'Your AI teacher that listens, sees, and teaches you visually. Upload PDFs, images, videos - get instant mind maps, explanations, and personalized quizzes.',
      'hero.tryVoiceDemo': 'Try Voice Demo',
      'hero.watchDemo': 'Watch Demo',
      
      // Features
      'features.title': 'Advanced Features That Transform Learning',
      'features.voiceTitle': 'Voice-First AI Tutor',
      'features.voiceDesc': 'Simply speak your questions. AI listens, understands, and responds with both voice and visual explanations.',
      'features.canvasTitle': 'Visual Learning Canvas',
      'features.canvasDesc': 'Auto-generated mind maps and concept connections. See relationships between topics with interactive interface.',
      'features.testTitle': 'Smart Test Generator',
      'features.testDesc': 'AI creates personalized quizzes based on your study materials. Identifies weak areas and generates targeted practice.',
      'features.multiModalTitle': 'Multi-Modal Input',
      'features.multiModalDesc': 'Upload PDFs, images, handwritten notes, or YouTube links. AI extracts and explains everything.',
      
      // Chat interface
      'chat.placeholder': 'Ask me anything or upload your study materials...',
      'chat.listening': 'Listening...',
      'chat.aiThinking': 'AI is thinking...',
      
      // Materials sidebar
      'materials.title': 'My Materials',
      'materials.upload': 'Upload Content',
      'materials.empty': 'No materials uploaded yet',
      
      // Common buttons
      'button.upload': 'Upload',
      'button.export': 'Export',
      'button.generate': 'Generate',
      'button.save': 'Save',
      'button.cancel': 'Cancel',
    }
  },
  es: {
    translation: {
      'nav.features': 'Características',
      'nav.canvas': 'Lienzo Visual',
      'nav.pricing': 'Precios',
      'nav.demo': 'Demo',
      'nav.signIn': 'Iniciar Sesión',
      'nav.getStarted': 'Comenzar Gratis',
      
      'hero.badge': 'Revolución del Aprendizaje con IA',
      'hero.title': 'Conoce EduVoice AI',
      'hero.subtitle': 'La Plataforma de Aprendizaje Visual Parlante',
      'hero.description': 'Tu profesor de IA que escucha, ve y te enseña visualmente. Sube PDFs, imágenes, videos - obtén mapas mentales, explicaciones y cuestionarios personalizados al instante.',
      'hero.tryVoiceDemo': 'Probar Demo de Voz',
      'hero.watchDemo': 'Ver Demo',
      
      'features.title': 'Características Avanzadas Que Transforman el Aprendizaje',
      'features.voiceTitle': 'Tutor IA de Voz Primero',
      'features.voiceDesc': 'Simplemente habla tus preguntas. La IA escucha, entiende y responde con explicaciones de voz y visuales.',
      'features.canvasTitle': 'Lienzo de Aprendizaje Visual',
      'features.canvasDesc': 'Mapas mentales generados automáticamente y conexiones de conceptos. Ve relaciones entre temas con interfaz interactiva.',
      
      'chat.placeholder': 'Pregúntame cualquier cosa o sube tus materiales de estudio...',
      'chat.listening': 'Escuchando...',
      'chat.aiThinking': 'La IA está pensando...',
      
      'materials.title': 'Mis Materiales',
      'materials.upload': 'Subir Contenido',
      'materials.empty': 'Aún no se han subido materiales',
    }
  },
  fr: {
    translation: {
      'nav.features': 'Fonctionnalités',
      'nav.canvas': 'Canevas Visuel',
      'nav.pricing': 'Tarifs',
      'nav.demo': 'Démo',
      'nav.signIn': 'Se Connecter',
      'nav.getStarted': 'Commencer Gratuitement',
      
      'hero.badge': 'Révolution de l\'Apprentissage par IA',
      'hero.title': 'Découvrez EduVoice AI',
      'hero.subtitle': 'La Plateforme d\'Apprentissage Visuel Parlante',
      'hero.description': 'Votre professeur IA qui écoute, voit et vous enseigne visuellement. Téléchargez des PDFs, images, vidéos - obtenez des cartes mentales, explications et quiz personnalisés instantanément.',
      
      'chat.placeholder': 'Demandez-moi n\'importe quoi ou téléchargez vos supports d\'étude...',
      'materials.title': 'Mes Matériaux',
      'materials.upload': 'Télécharger du Contenu',
    }
  },
  de: {
    translation: {
      'nav.features': 'Funktionen',
      'nav.canvas': 'Visuelle Leinwand',
      'nav.pricing': 'Preise',
      'nav.demo': 'Demo',
      'nav.signIn': 'Anmelden',
      'nav.getStarted': 'Kostenlos Starten',
      
      'hero.title': 'Lernen Sie EduVoice AI kennen',
      'hero.subtitle': 'Die Sprechende Visuelle Lernplattform',
      
      'chat.placeholder': 'Fragen Sie mich alles oder laden Sie Ihre Lernmaterialien hoch...',
      'materials.title': 'Meine Materialien',
      'materials.upload': 'Inhalt Hochladen',
    }
  },
  hi: {
    translation: {
      'nav.features': 'विशेषताएं',
      'nav.canvas': 'विज़ुअल कैनवास',
      'nav.pricing': 'मूल्य निर्धारण',
      'nav.demo': 'डेमो',
      'nav.signIn': 'साइन इन करें',
      'nav.getStarted': 'मुफ्त शुरुआत करें',
      
      'hero.title': 'EduVoice AI से मिलें',
      'hero.subtitle': 'बोलने वाला विज़ुअल लर्निंग प्लेटफॉर्म',
      
      'chat.placeholder': 'मुझसे कुछ भी पूछें या अपनी अध्ययन सामग्री अपलोड करें...',
      'materials.title': 'मेरी सामग्री',
      'materials.upload': 'सामग्री अपलोड करें',
    }
  },
  ar: {
    translation: {
      'nav.features': 'الميزات',
      'nav.canvas': 'اللوحة البصرية',
      'nav.pricing': 'التسعير',
      'nav.demo': 'العرض التوضيحي',
      'nav.signIn': 'تسجيل الدخول',
      'nav.getStarted': 'ابدأ مجاناً',
      
      'hero.title': 'تعرف على EduVoice AI',
      'hero.subtitle': 'منصة التعلم البصرية المتحدثة',
      
      'chat.placeholder': 'اسألني أي شيء أو ارفع مواد الدراسة...',
      'materials.title': 'موادي',
      'materials.upload': 'رفع المحتوى',
    }
  },
  zh: {
    translation: {
      'nav.features': '功能',
      'nav.canvas': '可视化画布',
      'nav.pricing': '定价',
      'nav.demo': '演示',
      'nav.signIn': '登录',
      'nav.getStarted': '免费开始',
      
      'hero.title': '认识 EduVoice AI',
      'hero.subtitle': '会说话的可视化学习平台',
      
      'chat.placeholder': '问我任何问题或上传您的学习材料...',
      'materials.title': '我的材料',
      'materials.upload': '上传内容',
    }
  },
  ja: {
    translation: {
      'nav.features': '機能',
      'nav.canvas': 'ビジュアルキャンバス',
      'nav.pricing': '料金',
      'nav.demo': 'デモ',
      'nav.signIn': 'サインイン',
      'nav.getStarted': '無料で始める',
      
      'hero.title': 'EduVoice AI をご紹介',
      'hero.subtitle': '話すビジュアル学習プラットフォーム',
      
      'chat.placeholder': '何でも質問するか、学習資料をアップロードしてください...',
      'materials.title': 'マイ資料',
      'materials.upload': 'コンテンツをアップロード',
    }
  }
};

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'th', name: 'ไทย', flag: '🇹🇭' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' }
];

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export { languages };
export default i18n;
