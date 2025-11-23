import React from 'react';
import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const Step4_AdditionalInfo: React.FC = () => {
  const { control, watch } = useFormContext();
  const previousInsurance = watch('previousInsurance');

  return (
    <div className="space-y-6">
      {/* Previous Insurance Question */}
      <FormField
        control={control}
        name="previousInsurance"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel className="text-base font-semibold">
              ¿Ha tenido seguro anteriormente? <span className="text-red-500">*</span>
            </FormLabel>
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

      {/* Conditional fields shown when previousInsurance === 'si' */}
      {previousInsurance === 'si' && (
        <div className="space-y-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          {/* Previous Insurer */}
          <FormField
            control={control}
            name="previousInsurer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Aseguradora anterior</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Nombre de la aseguradora anterior"
                    autoComplete="off"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Claims History */}
          <FormField
            control={control}
            name="claimsHistory"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Historial de reclamaciones</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe cualquier reclamación previa que hayas realizado (opcional)"
                    autoComplete="off"
                    rows={4}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}

      {/* Additional Comments */}
      <FormField
        control={control}
        name="additionalComments"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Comentarios adicionales</FormLabel>
            <FormControl>
              <Textarea
                placeholder="¿Hay algo más que quieras compartir o preguntar sobre tu cotización?"
                autoComplete="off"
                rows={4}
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

export default Step4_AdditionalInfo;
