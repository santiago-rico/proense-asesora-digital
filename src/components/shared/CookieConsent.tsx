import React, { useState, useEffect } from 'react';
import { Cookie, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { 
  hasCookieConsent, 
  setCookieConsent, 
  shouldRequestConsentAgain 
} from '@/utils/cookies';

interface CookieConsentProps {
  className?: string;
}

export const CookieConsent: React.FC<CookieConsentProps> = ({ className }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Check if we need to show the consent banner
    const shouldShow = !hasCookieConsent() || shouldRequestConsentAgain();
    
    if (shouldShow) {
      // Small delay to ensure page is loaded
      const timer = setTimeout(() => {
        setIsVisible(true);
        setIsAnimating(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    setCookieConsent('accepted');
    dismissBanner();
  };

  const handleDecline = () => {
    setCookieConsent('declined');
    dismissBanner();
  };

  const dismissBanner = () => {
    setIsAnimating(false);
    // Wait for animation to complete before hiding
    setTimeout(() => {
      setIsVisible(false);
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div 
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6",
        "transition-transform duration-300 ease-in-out",
        isAnimating ? "translate-y-0" : "translate-y-full",
        className
      )}
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-description"
    >
      <Card className="mx-auto max-w-4xl bg-white/95 backdrop-blur-sm border-2 border-primary/20 shadow-lg">
        <div className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Icon and Content */}
            <div className="flex items-start gap-3 flex-1">
              <div className="flex-shrink-0 mt-1">
                <Cookie className="w-6 h-6 text-primary" aria-hidden="true" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 
                  id="cookie-consent-title"
                  className="text-lg font-semibold text-gray-900 mb-2"
                >
                  Uso de Cookies
                </h3>
                <p 
                  id="cookie-consent-description"
                  className="text-sm text-gray-600 leading-relaxed"
                >
                  Utilizamos cookies para mejorar tu experiencia en nuestro sitio web, 
                  personalizar contenido y analizar el tráfico. Las cookies nos ayudan a 
                  ofrecerte un mejor servicio y recordar tus preferencias.{' '}
                  <a 
                    href="/politica-de-privacidad" 
                    className="text-primary hover:text-primary/80 underline font-medium"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Conoce más sobre nuestra política de privacidad
                  </a>.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 md:flex-shrink-0">
              <Button
                onClick={handleDecline}
                variant="outline"
                size="sm"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Rechazar
              </Button>
              <Button
                onClick={handleAccept}
                size="sm"
                className="bg-primary hover:bg-primary/90 text-white font-medium"
              >
                Aceptar Cookies
              </Button>
            </div>

            {/* Close Button */}
            <button
              onClick={dismissBanner}
              className="absolute top-2 right-2 md:relative md:top-auto md:right-auto p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Cerrar banner de cookies"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CookieConsent;