import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/ui/theme-provider";
import { languages } from "@/lib/i18n";
import { Globe, Moon, Sun, Mic, Menu, X } from "lucide-react";

export function Navigation() {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-screen-2xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Mic className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                EduVoice AI
              </h1>
              <p className="text-xs text-muted-foreground">Voice-First Learning</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              {t('nav.features')}
            </a>
            <a href="#canvas" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              {t('nav.canvas')}
            </a>
            <a href="#pricing" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              {t('nav.pricing')}
            </a>
            <a href="#demo" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              {t('nav.demo')}
            </a>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center space-x-2" data-testid="language-selector">
                  <Globe className="w-5 h-5" />
                  <span className="text-sm font-medium">{currentLanguage.flag} {currentLanguage.code.toUpperCase()}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 max-h-96 overflow-y-auto" data-testid="language-dropdown">
                <div className="grid grid-cols-2 gap-1 p-2">
                  {languages.map((lang) => (
                    <DropdownMenuItem 
                      key={lang.code}
                      className="flex items-center space-x-3 cursor-pointer"
                      onClick={() => changeLanguage(lang.code)}
                      data-testid={`language-${lang.code}`}
                    >
                      <span className="text-lg">{lang.flag}</span>
                      <span className="text-sm">{lang.name}</span>
                      {currentLanguage.code === lang.code && (
                        <div className="w-2 h-2 rounded-full bg-primary ml-auto" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle */}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              data-testid="theme-toggle"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center space-x-3">
              <Button variant="ghost" data-testid="button-signin">
                {t('nav.signIn')}
              </Button>
              <Button className="bg-gradient-to-r from-primary to-accent text-primary-foreground" data-testid="button-getstarted">
                {t('nav.getStarted')}
              </Button>
            </div>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              data-testid="mobile-menu-toggle"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border pt-4">
            <div className="flex flex-col space-y-3">
              <a href="#features" className="text-sm font-medium text-foreground hover:text-primary transition-colors py-2">
                {t('nav.features')}
              </a>
              <a href="#canvas" className="text-sm font-medium text-foreground hover:text-primary transition-colors py-2">
                {t('nav.canvas')}
              </a>
              <a href="#pricing" className="text-sm font-medium text-foreground hover:text-primary transition-colors py-2">
                {t('nav.pricing')}
              </a>
              <a href="#demo" className="text-sm font-medium text-foreground hover:text-primary transition-colors py-2">
                {t('nav.demo')}
              </a>
              <div className="pt-3 border-t border-border">
                <div className="flex flex-col space-y-2">
                  <Button variant="ghost" className="justify-start" data-testid="mobile-signin">
                    {t('nav.signIn')}
                  </Button>
                  <Button className="bg-gradient-to-r from-primary to-accent text-primary-foreground justify-start" data-testid="mobile-getstarted">
                    {t('nav.getStarted')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
