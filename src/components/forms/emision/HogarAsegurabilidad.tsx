import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  HOGAR_ASEGURABILIDAD_DISCLAIMER,
  HOGAR_ASEGURABILIDAD_TITLE,
  getAsegurabilidadQuestions,
  type AsegurabilidadRamo,
} from '@/data/hogarAsegurabilidad';

const ANSWER_OPTIONS = [
  { value: 'si', label: 'Sí' },
  { value: 'no', label: 'No' },
] as const;

interface HogarAsegurabilidadProps {
  ramo: AsegurabilidadRamo;
}

// Declaración de asegurabilidad for Seguro de Hogar and Seguro Empresarial,
// each with its own wording. Every question must be answered, but nothing is
// preselected: the client has to declare each answer. A "Sí" is informational
// for the asesor and never blocks the submission.
const HogarAsegurabilidad: React.FC<HogarAsegurabilidadProps> = ({ ramo }) => {
  const { control, clearErrors } = useFormContext();

  return (
    <fieldset className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
      <legend className="text-base font-semibold">
        {HOGAR_ASEGURABILIDAD_TITLE} <span className="text-red-500">*</span>
      </legend>
      <p className="text-sm text-gray-600 dark:text-gray-400">{HOGAR_ASEGURABILIDAD_DISCLAIMER}</p>

      <ol className="divide-y divide-gray-200 dark:divide-gray-700 rounded-md border border-gray-200 dark:border-gray-700">
        {getAsegurabilidadQuestions(ramo).map((q, index) => {
          const questionId = `${q.key}-pregunta`;
          return (
            <li key={q.key} className="p-4">
              <FormField
                control={control}
                name={q.key}
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                      <p id={questionId} className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">
                        <span className="font-medium">{index + 1}.</span> {q.question}
                      </p>
                      <FormControl>
                        <RadioGroup
                          aria-labelledby={questionId}
                          onValueChange={(value) => {
                            field.onChange(value);
                            // Any answer is valid, so drop a stale "Responde esta pregunta." right away
                            clearErrors(q.key);
                          }}
                          value={field.value || ''}
                          className="flex flex-row gap-6 shrink-0"
                        >
                          {ANSWER_OPTIONS.map(option => (
                            <FormItem key={option.value} className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value={option.value} />
                              </FormControl>
                              <FormLabel className="font-normal">{option.label}</FormLabel>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </li>
          );
        })}
      </ol>
    </fieldset>
  );
};

export default HogarAsegurabilidad;
