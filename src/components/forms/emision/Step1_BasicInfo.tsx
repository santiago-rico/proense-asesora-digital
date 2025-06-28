import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PhoneInput } from "@/components/ui/phone-input";
import es from 'react-phone-number-input/locale/es.json';

const Step1_BasicInfo = () => {
  const { control } = useFormContext();

  return (
    <div className="space-y-6">
      <FormField
        control={control}
        name="nombreCompleto"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nombre completo <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <Input 
                placeholder="Tu nombre completo" 
                autoComplete="name"
                required
                aria-required="true"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="telefono"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Número de teléfono <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <PhoneInput 
                placeholder="Número telefónico"
                defaultCountry="CO" 
                labels={es}
                searchPlaceholder="Buscar país..."
                autoComplete="tel"
                required
                aria-required="true"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Correo Electrónico <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <Input 
                type="email" 
                placeholder="tu@email.com" 
                autoComplete="email"
                required
                aria-required="true"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default Step1_BasicInfo;
