import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const ANSWER_OPTIONS = [
  { value: 'si', label: 'Sí' },
  { value: 'no', label: 'No' },
] as const;

interface AsegurabilidadSiNoFieldProps {
  name: string;
  question: string;
  /** Shown before the question, e.g. "1."; follow-up questions have none. */
  number?: string;
  /** Marks the question "(opcional)". */
  optional?: boolean;
  /** Called after the answer is stored, e.g. to reset follow-up questions. */
  onAnswer?: (value: string) => void;
}

// One Sí/No question of a declaración de asegurabilidad. Nothing is
// preselected: the client has to declare each answer. The question text names
// the radio group, so screen readers announce what is being answered.
const AsegurabilidadSiNoField: React.FC<AsegurabilidadSiNoFieldProps> = ({ name, question, number, optional, onAnswer }) => {
  const { control, clearErrors } = useFormContext();
  const questionId = `${name}-pregunta`;

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <p id={questionId} className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">
              {number && <span className="font-medium">{number}</span>} {question}
              {/* Space outside the span, or the accessible name loses it */}
              {optional && <>{' '}<span className="text-gray-500 dark:text-gray-400">(opcional)</span></>}
            </p>
            <FormControl>
              <RadioGroup
                aria-labelledby={questionId}
                onValueChange={(value) => {
                  field.onChange(value);
                  // Any answer is valid, so drop a stale "Responde esta pregunta." right away
                  clearErrors(name);
                  onAnswer?.(value);
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
  );
};

export default AsegurabilidadSiNoField;
