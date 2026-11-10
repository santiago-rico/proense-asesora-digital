import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import React from "react";
import {
  Accessibility,
  Activity,
  Ambulance,
  Baby,
  BedDouble,
  Bike,
  BookUser,
  BriefcaseBusiness,
  Building2,
  Car,
  CheckCircle,
  Church,
  ClipboardList,
  Clock,
  CreditCard,
  FileSearch2,
  FileX2,
  Flame,
  Gavel,
  GlassWater,
  Globe,
  Hammer,
  HardHat,
  HeartHandshake,
  Home,
  Hospital,
  Hotel,
  KeyRound,
  Landmark,
  Laptop,
  Luggage,
  PhoneCall,
  Plane,
  PlaneTakeoff,
  Receipt,
  Recycle,
  Scale,
  Search,
  Server,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  TestTube2,
  TrendingDown,
  Truck,
  UserCheck,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// The icons the product data (src/data/insuranceProductsData.ts) names in its
// coverages. Named imports keep the bundle to these: importing the whole
// lucide-react namespace put every Lucide icon (about 2,000) in the vendor
// chunk that every page loads. A name the data uses must be added here, or it
// renders the default icon; utils.test.ts checks the data against this map.
const ICONS_BY_NAME: Record<string, LucideIcon> = {
  Accessibility,
  Activity,
  Ambulance,
  Baby,
  BedDouble,
  Bike,
  BookUser,
  BriefcaseBusiness,
  Building2,
  Car,
  Church,
  ClipboardList,
  Clock,
  CreditCard,
  FileSearch2,
  FileX2,
  Flame,
  Gavel,
  GlassWater,
  Globe,
  Hammer,
  HardHat,
  HeartHandshake,
  Home,
  Hospital,
  Hotel,
  KeyRound,
  Landmark,
  Laptop,
  Luggage,
  PhoneCall,
  Plane,
  PlaneTakeoff,
  Receipt,
  Recycle,
  Scale,
  Search,
  Server,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  TestTube2,
  TrendingDown,
  Truck,
  UserCheck,
  Users,
  Wrench,
};

// The icon for a name from the product data, or a default icon if the name is
// not in ICONS_BY_NAME.
export const getIcon = (iconName?: string): React.ElementType | null => {
  if (!iconName) return null;
  return Object.prototype.hasOwnProperty.call(ICONS_BY_NAME, iconName)
    ? ICONS_BY_NAME[iconName]
    : CheckCircle;
};
