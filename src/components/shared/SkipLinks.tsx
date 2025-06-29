import React from "react";
import { cn } from "@/lib/utils";

const SkipLinks = () => {
  return (
    <div className="sr-only focus-within:not-sr-only">
      <a
        href="#main-content"
        className={cn(
          "absolute left-4 top-4 z-[100] rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-900",
          "shadow-lg ring-1 ring-gray-900/10",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
          "transition-all duration-200 ease-in-out",
          "hover:bg-gray-50"
        )}
      >
        Saltar al contenido principal
      </a>
      <a
        href="#main-navigation"
        className={cn(
          "absolute left-4 top-14 z-[100] rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-900",
          "shadow-lg ring-1 ring-gray-900/10",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
          "transition-all duration-200 ease-in-out",
          "hover:bg-gray-50"
        )}
      >
        Saltar a la navegación
      </a>
    </div>
  );
};

export default SkipLinks;