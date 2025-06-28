import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import React from "react";
import * as LucideIcons from "lucide-react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper to get a Lucide icon component by name
export const getIcon = (iconName?: string): React.ElementType | null => {
  if (!iconName) return null;
  const IconComponent = (LucideIcons as any)[iconName];
  return IconComponent || LucideIcons.CheckCircle; // Default icon if not found
};
