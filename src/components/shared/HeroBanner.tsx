import React from "react";
import { Button } from "@/components/ui/button";

interface HeroBannerProps {
  title: string;
  description: string;
  ctaText: string;
  backgroundImage: string;
  imagePosition?: string;
  handleOpenLeadDialog: () => void;
}

function HeroBanner({
  title,
  description,
  ctaText,
  backgroundImage,
  imagePosition,
  handleOpenLeadDialog,
}: HeroBannerProps) {
  return (
    <div 
      className="relative overflow-hidden h-[50vh] min-h-[400px]"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: imagePosition || 'center 25%',
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30"></div>
      
      <div className="container relative mx-auto px-4 h-full flex items-center">
        <div className="relative z-10 max-w-2xl text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-slide-in">{title}</h1>
          <p className="text-lg md:text-xl mb-8 animate-fade-in opacity-90">{description}</p>
          <div className="flex">
            <Button 
              size="lg" 
              variant="secondary" 
              className="animate-fade-in" 
              style={{ animationDelay: "200ms" }} 
              onClick={handleOpenLeadDialog}
            >
              {ctaText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
