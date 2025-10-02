import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Mic, 
  Play, 
  Star, 
  Brain, 
  FileText, 
  Image, 
  Youtube, 
  Zap,
  Globe,
  Target,
  Users,
  CheckCircle,
  ArrowRight,
  Sparkles,
  MessageCircle,
  Download,
  Palette,
  BarChart
} from "lucide-react";
import { FloatingVoiceButton } from "@/components/layout/floating-voice-button";

export default function Home() {
  const { t } = useTranslation();

  const features = [
    {
      icon: <Mic className="w-6 h-6 text-primary" />,
      title: t('features.voiceTitle'),
      description: t('features.voiceDesc'),
      gradient: "from-primary to-blue-500"
    },
    {
      icon: <Brain className="w-6 h-6 text-secondary" />,
      title: t('features.canvasTitle'),
      description: t('features.canvasDesc'),
      gradient: "from-secondary to-cyan-500"
    },
    {
      icon: <Target className="w-6 h-6 text-green-500" />,
      title: t('features.testTitle'),
      description: t('features.testDesc'),
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: <FileText className="w-6 h-6 text-purple-500" />,
      title: t('features.multiModalTitle'),
      description: t('features.multiModalDesc'),
      gradient: "from-purple-500 to-pink-500"
    }
  ];

  const steps = [
    {
      number: "1",
      title: "Upload Your Content",
      description: "Drop PDFs, images, videos, or YouTube links. AI processes everything instantly.",
      icons: [
        <FileText className="w-5 h-5 text-red-500" />,
        <Image className="w-5 h-5 text-blue-500" />,
        <Youtube className="w-5 h-5 text-red-600" />
      ]
    },
    {
      number: "2",
      title: "AI Analyzes & Creates",
      description: "Advanced AI extracts concepts, relationships, and generates visual connections automatically.",
      icons: [<Brain className="w-5 h-5 text-primary animate-pulse" />]
    },
    {
      number: "3",
      title: "Learn & Interact",
      description: "Explore your personalized mind map, ask questions, and get AI explanations with voice support.",
      icons: [<CheckCircle className="w-5 h-5 text-green-500" />]
    }
  ];

  const pricingPlans = [
    {
      name: "Free",
      price: "$0",
      period: "/month",
      description: "Perfect for trying out",
      features: [
        "10 AI queries per day",
        "Basic visual canvas", 
        "3 languages support",
        "PDF upload (max 5MB)"
      ],
      popular: false,
      buttonText: "Get Started",
      buttonVariant: "outline" as const
    },
    {
      name: "Student Pro",
      price: "₹499",
      period: "/month",
      description: "Everything you need to excel",
      features: [
        "Unlimited AI queries",
        "Advanced visual canvas",
        "50+ languages",
        "Unlimited uploads",
        "Voice responses",
        "Smart test generator",
        "Export to PDF/PNG"
      ],
      popular: true,
      buttonText: "Upgrade Now",
      buttonVariant: "default" as const
    },
    {
      name: "Teacher Pro",
      price: "₹999", 
      period: "/month",
      description: "For educators & institutions",
      features: [
        "Everything in Student Pro",
        "Lesson plan generator", 
        "Student analytics",
        "Collaborative canvas",
        "Class management",
        "Priority support"
      ],
      popular: false,
      buttonText: "Contact Sales",
      buttonVariant: "outline" as const
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-screen-2xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <Badge className="inline-flex items-center space-x-2 px-4 py-2 bg-primary/10 text-primary border-primary/20">
                <Sparkles className="w-4 h-4" />
                <span className="font-medium">{t('hero.badge')}</span>
              </Badge>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                {t('hero.title')} <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">AI</span>
              </h1>

              <p className="text-xl md:text-2xl text-muted-foreground font-medium">
                {t('hero.subtitle')}
              </p>

              <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
                {t('hero.description')}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-xl hover:scale-105 transition-transform"
                  data-testid="button-try-voice-demo"
                >
                  <Mic className="w-5 h-5 mr-2" />
                  {t('hero.tryVoiceDemo')}
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-2 hover:bg-primary/5"
                  data-testid="button-watch-demo"
                >
                  <Play className="w-5 h-5 mr-2" />
                  {t('hero.watchDemo')}
                </Button>
              </div>

              {/* Social Proof */}
              <div className="flex items-center space-x-8 pt-4">
                <div className="flex -space-x-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 border-2 border-background" />
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-blue-500 border-2 border-background" />
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-red-500 border-2 border-background" />
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 border-2 border-background" />
                </div>
                <div>
                  <div className="flex items-center space-x-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">50,000+</strong> students learning smarter
                  </p>
                </div>
              </div>
            </div>

            {/* Right Visual - Interactive Canvas Preview */}
            <div className="relative">
              <Card className="bg-card/80 backdrop-blur-sm border shadow-2xl overflow-hidden">
                {/* Browser Header */}
                <div className="bg-gradient-to-r from-primary to-accent p-3 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <span className="text-white text-xs font-medium">EduVoice AI Platform</span>
                  <div className="w-16" />
                </div>

                {/* Canvas Preview */}
                <div className="relative h-96 bg-gradient-to-br from-muted/30 to-muted/10">
                  {/* Grid Pattern */}
                  <div className="absolute inset-0 opacity-20">
                    <div 
                      className="w-full h-full"
                      style={{
                        backgroundImage: `
                          linear-gradient(hsl(var(--primary) / 0.1) 1px, transparent 1px),
                          linear-gradient(90deg, hsl(var(--primary) / 0.1) 1px, transparent 1px)
                        `,
                        backgroundSize: '20px 20px'
                      }}
                    />
                  </div>

                  {/* Central Node */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                    <div className="bg-gradient-to-br from-primary to-accent text-primary-foreground px-6 py-4 rounded-xl shadow-lg font-semibold animate-pulse">
                      Machine Learning
                    </div>
                  </div>

                  {/* Branch Nodes */}
                  <div className="absolute top-20 left-20 bg-card border-2 border-blue-500/50 px-4 py-3 rounded-lg shadow-md">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-sm font-medium">Supervised</span>
                    </div>
                  </div>

                  <div className="absolute top-32 right-24 bg-card border-2 border-green-500/50 px-4 py-3 rounded-lg shadow-md">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-sm font-medium">Unsupervised</span>
                    </div>
                  </div>

                  <div className="absolute bottom-24 left-16 bg-card border-2 border-purple-500/50 px-4 py-3 rounded-lg shadow-md">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500" />
                      <span className="text-sm font-medium">Deep Learning</span>
                    </div>
                  </div>

                  {/* Connection Lines */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                    <line x1="50%" y1="50%" x2="20%" y2="25%" stroke="hsl(var(--primary) / 0.4)" strokeWidth="2" strokeDasharray="5,5" />
                    <line x1="50%" y1="50%" x2="75%" y2="30%" stroke="hsl(var(--primary) / 0.4)" strokeWidth="2" strokeDasharray="5,5" />
                    <line x1="50%" y1="50%" x2="25%" y2="75%" stroke="hsl(var(--primary) / 0.4)" strokeWidth="2" strokeDasharray="5,5" />
                  </svg>

                  {/* AI Status */}
                  <div className="absolute top-4 right-4 flex items-center space-x-2 bg-card/90 backdrop-blur-sm px-3 py-2 rounded-full shadow-lg">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs font-medium">AI Analyzing...</span>
                  </div>
                </div>

                {/* Chat Preview */}
                <div className="border-t bg-card/90 backdrop-blur-sm p-4">
                  <div className="flex items-center space-x-3">
                    <Button size="sm" className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
                      <Mic className="w-4 h-4" />
                    </Button>
                    <div className="flex-1 bg-muted rounded-full px-4 py-2 text-sm text-muted-foreground">
                      {t('chat.placeholder')}
                    </div>
                    <Button variant="ghost" size="sm">
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Floating Elements */}
              <div className="absolute -top-6 -right-6 w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <Zap className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-screen-xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              How <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">EduVoice AI</span> Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Transform your learning experience in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={step.number} className="relative group">
                <Card className="p-8 h-full hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20">
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    {step.number}
                  </div>

                  <div className="mb-6 mt-4">
                    <div className="flex items-center space-x-2 mb-4">
                      {step.icons.map((icon, i) => (
                        <div key={i} className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                          {icon}
                        </div>
                      ))}
                    </div>
                    <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </Card>

                {/* Arrow for desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-8 h-8 text-primary opacity-50" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-screen-xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Powerful <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Features</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need for next-generation learning
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300 group hover:-translate-y-2">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>

          {/* Additional Features */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
              <Globe className="w-8 h-8 mb-4 text-primary" />
              <h4 className="font-bold text-lg mb-2">50+ Languages</h4>
              <p className="text-sm text-muted-foreground">
                Learn in your native language with real-time translation and voice support
              </p>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-secondary/5 to-primary/5 border-secondary/20">
              <BarChart className="w-8 h-8 mb-4 text-secondary" />
              <h4 className="font-bold text-lg mb-2">Progress Tracking</h4>
              <p className="text-sm text-muted-foreground">
                Monitor your learning journey with detailed analytics and insights
              </p>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-green-500/5 to-blue-500/5 border-green-500/20">
              <Download className="w-8 h-8 mb-4 text-green-500" />
              <h4 className="font-bold text-lg mb-2">Export Anywhere</h4>
              <p className="text-sm text-muted-foreground">
                Download mind maps, quizzes, and notes as PDF, PNG, or share instantly
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-screen-xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Choose Your <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Learning Plan</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Start free, upgrade when you need more. All plans include multilingual support.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card key={plan.name} className={`relative p-8 ${plan.popular ? 'border-2 border-primary shadow-xl scale-105' : ''}`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-primary to-accent text-primary-foreground">
                    Most Popular
                  </Badge>
                )}

                <CardContent className="p-0">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <p className="text-muted-foreground text-sm">{plan.description}</p>
                  </div>

                  <div className="text-center mb-6">
                    <span className="text-5xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    variant={plan.buttonVariant}
                    className={`w-full ${plan.popular ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground' : ''}`}
                  >
                    {plan.buttonText}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-90" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJhNCA0IDAgMCAwLTggMGgtMmE0IDQgMCAwIDAtOCAwSDR2LTJoMTJhNCA0IDAgMCAwIDgtMGgyYTQgNCA0IDAgMCAwIDgtMGgxMnYyek00IDI2aDEyYTQgNCAwIDAgMCA4IDBoMmE0IDQgMCAwIDAgOCAwaDEydi0ySDM2YTQgNCAwIDAgMC04IDBoLTJhNCA0IDAgMCAwLTggMEg0djJ6bTAgOGgxMmE0IDQgMCAwIDAgOCAwaDJhNCA0IDAgMCAwIDggMGgxMnYtMkgzNmE0IDQgMCAwIDAtOCAwSDI2YTQgNCA0IDAgMCAwLTggMEg0djJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-10" />

        <div className="relative z-10 max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-xl mb-10 opacity-90">
            Join 50,000+ students already using EduVoice AI. Start your journey to smarter learning today.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Link href="/platform">
              <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-gray-100">
                <Mic className="w-5 h-5 mr-2" />
                Start Free Trial
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <Users className="w-5 h-5 mr-2" />
              Book a Demo
            </Button>
          </div>

          <p className="text-sm opacity-75">
            No credit card required • 7-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Floating Voice Button */}
      <FloatingVoiceButton 
        onTranscription={(text) => {
          console.log('Voice input:', text);
        }}
      />
    </div>
  );
}
