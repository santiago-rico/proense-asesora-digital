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
 * Includes basic insurance types for customer acquisition, plus every
 * /seguros/<type> product page type, whose LeadForm preselects it
 */
export const LEAD_FORM_INSURANCE_TYPES: InsuranceType[] = [
  { value: "vida", label: "Seguro de Vida" },
  { value: "vida-deudores", label: "Seguro de Vida Deudores" },
  { value: "salud", label: "Seguro de Salud" },
  { value: "hogar", label: "Seguro de Hogar" },
  { value: "arrendamiento", label: "Seguro de Arrendamiento" },
  { value: "auto", label: "Seguro de Auto" },
  { value: "motos", label: "Seguro de Motos" },
  { value: "viaje", label: "Seguro de Viaje" },
  { value: "arl", label: "ARL" },
  { value: "empresarial", label: "Seguro Empresarial" },
  { value: "pymes", label: "Seguro para PYMES" },
  { value: "mascotas", label: "Seguro para Mascotas" },
];

/**
 * The LeadForm option for an insurance type (e.g. a product page's type), or ""
 * (nothing selected) when it isn't one: the select would render blank yet the
 * form would still submit the unknown value
 */
export function toLeadFormInsuranceType(type?: string): string {
  return type && LEAD_FORM_INSURANCE_TYPES.some((option) => option.value === type) ? type : "";
}

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