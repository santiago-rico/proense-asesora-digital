import React from "react";
import { Button } from "@/components/ui/button";
import OptimizedImage from "@/components/shared/OptimizedImage";

interface HeroBannerProps {
  title: string;
  description: string;
  backgroundImage: string;
  imagePosition?: string;
  ctaText?: string;
  handleOpenLeadDialog?: () => void;
  useOptimizedImage?: boolean;
}

function HeroBanner({
  title,
  description,
  ctaText,
  backgroundImage,
  imagePosition,
  handleOpenLeadDialog,
  useOptimizedImage = false,
}: HeroBannerProps) {
  // Traditional background image approach for backward compatibility
  if (!useOptimizedImage) {
    return (
      <div 
        className="relative overflow-hidden h-[40vh] sm:h-[45vh] md:h-[50vh] min-h-[300px] sm:min-h-[350px] md:min-h-[400px]"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: imagePosition || 'center 25%',
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/30"></div>
        
        <div className="container relative mx-auto px-4 sm:px-6 h-full flex items-center justify-center md:justify-start">
          <div className="relative z-10 max-w-2xl mx-auto md:mx-0 md:ml-[4rem] lg:ml-[7rem] text-white text-center md:text-left">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 animate-slide-in">{title}</h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-6 sm:mb-8 animate-fade-in opacity-90">{description}</p>
            <div className="flex justify-center md:justify-start">
              {ctaText && handleOpenLeadDialog && (
                <Button 
                  size="lg" 
                  variant="secondary" 
                  className="animate-fade-in" 
                  style={{ animationDelay: "200ms" }} 
                  onClick={handleOpenLeadDialog}
                >
                  {ctaText}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Optimized image approach using OptimizedImage component
  return (
    <div className="relative overflow-hidden h-[40vh] sm:h-[45vh] md:h-[50vh] min-h-[300px] sm:min-h-[350px] md:min-h-[400px]">
      {/* Optimized background image */}
      <OptimizedImage
        src={backgroundImage}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ objectPosition: imagePosition || 'center 25%' }}
        loading="eager"
        sizes="100vw"
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30"></div>
      
      <div className="container relative mx-auto px-4 h-full flex items-center justify-center md:justify-start">
        <div className="relative z-10 max-w-2xl mx-auto md:mx-0 md:ml-[7rem] text-white text-center md:text-left">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 animate-slide-in">{title}</h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-6 sm:mb-8 animate-fade-in opacity-90">{description}</p>
          <div className="flex justify-center md:justify-start">
            {ctaText && handleOpenLeadDialog && (
              <Button 
                size="lg" 
                variant="secondary" 
                className="animate-fade-in" 
                style={{ animationDelay: "200ms" }} 
                onClick={handleOpenLeadDialog}
              >
                {ctaText}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
