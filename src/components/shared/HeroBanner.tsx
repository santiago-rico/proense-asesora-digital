import React from "react";
import { Button } from "@/components/ui/button";

interface HeroBannerProps {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  backgroundImage: string;
  imagePosition?: string;
}

const HeroBanner: React.FC<HeroBannerProps> = ({
  title,
  subtitle,
  ctaText,
  ctaLink,
  secondaryCtaText,
  secondaryCtaLink,
  backgroundImage,
  imagePosition,
}) => {
  return (
    <div 
      className="relative overflow-hidden h-[70vh] min-h-[500px]"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: imagePosition || 'center 15%',
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30"></div>
      
      <div className="container relative mx-auto px-4 h-full flex items-center">
        <div className="relative z-10 max-w-2xl text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-slide-in">{title}</h1>
          <p className="text-lg md:text-xl mb-8 animate-fade-in opacity-90">{subtitle}</p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Button asChild size="lg" variant="secondary" className="animate-fade-in" style={{ animationDelay: "200ms" }}>
              <a href={ctaLink}>{ctaText}</a>
            </Button>
            {secondaryCtaText && secondaryCtaLink && (
              <Button asChild variant="outline" size="lg" className="border-white text-white bg-black/30 hover:bg-white/20 animate-fade-in" style={{ animationDelay: "400ms" }}>
                <a href={secondaryCtaLink}>{secondaryCtaText}</a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
