import { useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fieldsHiddenForInsuranceType } from './formWiring';
import type { QuoteFormSchemaType } from './formSchema';

const tiposDeSeguro = [
    { value: "vida", label: "Seguro de Vida" },
    { value: "auto", label: "Seguro de Auto" },
    { value: "hogar", label: "Seguro de Hogar" },
    { value: "salud", label: "Seguro de Salud" },
    { value: "mascotas", label: "Seguro de Mascotas" },
];

const Step2_InsuranceSelection = () => {
  const { control, setValue } = useFormContext();

  return (
    <div className="space-y-6">
        <FormField
            control={control}
            name="insuranceType"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Tipo de seguro que deseas cotizar <span className="text-red-500">*</span></FormLabel>
                    <Select
                        onValueChange={(value) => {
                            field.onChange(value);
                            // Drop the answers of the type chosen before: they are
                            // not on Step 3 any more, so they must not be sent.
                            fieldsHiddenForInsuranceType(value as QuoteFormSchemaType['insuranceType']).forEach((name) =>
                                setValue(name, '')
                            );
                        }}
                        value={field.value || ''}
                    >
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
    </div>
  );
};

export default Step2_InsuranceSelection;
