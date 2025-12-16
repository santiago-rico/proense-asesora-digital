import React from 'react';
import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import FileUpload from './FileUpload';

const Step4_Declaration: React.FC = () => {
  const { control, watch } = useFormContext();
  const declaraRenta = watch('declaraRenta');

  return (
    <div className="space-y-6">
      <FormField
        control={control}
        name="declaraRenta"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel className="text-base font-semibold">¿Declara renta? <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value || ''}
                className="flex flex-col space-y-1 md:flex-row md:space-x-4 md:space-y-0"
              >
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="si" />
                  </FormControl>
                  <FormLabel className="font-normal">Sí</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="no" />
                  </FormControl>
                  <FormLabel className="font-normal">No</FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {declaraRenta === 'si' && (
        <FileUpload name="archivoDeclaracionRenta" label="Archivo declaración renta *" multiple />
      )}

      {declaraRenta === 'no' && (
        <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Por favor, proporciona la siguiente información financiera básica:
          </p>
          <FormField
            control={control}
            name="ingresosNoDeclarante"
            render={({ field }) => (
              <FormItem>
                <FormLabel>¿Cuántos son tus ingresos? <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="Escribe tus ingresos" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="egresosNoDeclarante"
            render={({ field }) => (
              <FormItem>
                <FormLabel>¿Cuántos son tus egresos? <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="Escribe tus egresos" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="activosNoDeclarante"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor total de tus activos <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="Escribe el valor total de activos" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="pasivosNoDeclarante"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor de tus pasivos <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="Escribe el valor total de pasivos" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  );
};

export default Step4_Declaration;
