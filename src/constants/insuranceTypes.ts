/**
 * Shared insurance type definitions used across forms
 */

export interface InsuranceType {
  value: string;
  label: string;
}

/**
 * Complete list of insurance types available in the system
 * Used for lead generation, cancellation, and modification forms
 */
export const INSURANCE_TYPES: InsuranceType[] = [
  { value: "vida", label: "Seguro de Vida" },
  { value: "salud", label: "Seguro de Salud" },
  { value: "auto", label: "Seguro de Auto" },
  { value: "hogar", label: "Seguro de Hogar" },
  { value: "pymes", label: "Seguro para PYMES" },
  { value: "mascotas", label: "Seguro de Mascotas" },
  { value: "motos", label: "Seguro de Motos" },
  { value: "arrendamiento", label: "Seguro de Arrendamiento" },
  { value: "viaje", label: "Seguro de Viaje" },
  { value: "arl", label: "ARL" },
  { value: "empresarial", label: "Seguro Empresarial" },
  { value: "otro", label: "Otro" },
];

/**
 * Insurance types for lead generation forms
 * Includes basic insurance types for customer acquisition
 */
export const LEAD_FORM_INSURANCE_TYPES: InsuranceType[] = [
  { value: "vida", label: "Seguro de Vida" },
  { value: "salud", label: "Seguro de Salud" },
  { value: "hogar", label: "Seguro de Hogar" },
  { value: "auto", label: "Seguro de Auto" },
  { value: "viaje", label: "Seguro de Viaje" },
  { value: "arl", label: "ARL" },
  { value: "empresarial", label: "Seguro Empresarial" },
  { value: "mascotas", label: "Seguro para Mascotas" },
];

/**
 * Insurance types for service forms (cancellation/modification)
 * Includes comprehensive list with "Otro" option for customer service
 */
export const SERVICE_FORM_INSURANCE_TYPES: InsuranceType[] = [
  { value: "vida", label: "Seguro de Vida" },
  { value: "salud", label: "Seguro de Salud" },
  { value: "auto", label: "Seguro de Auto" },
  { value: "hogar", label: "Seguro de Hogar" },
  { value: "pymes", label: "Seguro para PYMES" },
  { value: "mascotas", label: "Seguro de Mascotas" },
  { value: "motos", label: "Seguro de Motos" },
  { value: "arrendamiento", label: "Seguro de Arrendamiento" },
  { value: "viaje", label: "Seguro de Viaje" },
  { value: "otro", label: "Otro" },
];