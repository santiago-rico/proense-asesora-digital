import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const tiposDeSeguro = [
    { value: "vida", label: "Seguro de Vida" },
    { value: "salud", label: "Seguro de Salud" },
    { value: "hogar", label: "Seguro de Hogar" },
    { value: "auto", label: "Seguro de Autos" }, // Changed to Autos as per request
    { value: "empresarial", label: "Seguro Empresarial" },
    { value: "rentas", label: "Seguro de Rentas" },
    { value: "mascotas", label: "Seguro para Mascotas" },
    { value: "responsabilidad_civil", label: "Seguro de Responsabilidad Civil" },
    { value: "vida_credito_protegido", label: "Seguro de Vida - Crédito Protegido" },
];

const metodosPago = [
    { value: "tarjeta_credito", label: "Tarjeta de Crédito" },
    { value: "debito_automatico", label: "Débito Automático" },
    { value: "transferencia", label: "Transferencia Bancaria" },
];

const periodicidadPago = [
    { value: "mensual", label: "Mensual" },
    { value: "trimestral", label: "Trimestral" },
    { value: "semestral", label: "Semestral" },
    { value: "anual", label: "Anual" },
];


const Step2_InsuranceSelection = () => {
  const { control } = useFormContext();

  return (
    <div className="space-y-6">
        <FormField
            control={control}
            name="tipoSeguro"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Tipo de seguro que deseas contratar <span className="text-red-500">*</span></FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona un tipo de seguro" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {tiposDeSeguro.map((tipo) => (
                                <SelectItem key={tipo.value} value={tipo.value}>
                                    {tipo.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )}
        />
        <FormField
            control={control}
            name="metodoPago"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Método de pago preferido <span className="text-red-500">*</span></FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona un método de pago" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {metodosPago.map((metodo) => (
                                <SelectItem key={metodo.value} value={metodo.value}>
                                    {metodo.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )}
        />
        <FormField
            control={control}
            name="periodicidadPago"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Periodicidad de pago <span className="text-red-500">*</span></FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona la periodicidad" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {periodicidadPago.map((periodo) => (
                                <SelectItem key={periodo.value} value={periodo.value}>
                                    {periodo.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )}
        />
    </div>
  );
};

export default Step2_InsuranceSelection;
