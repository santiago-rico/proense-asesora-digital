import React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { HOGAR_ASEGURABILIDAD_DISCLAIMER, HOGAR_ASEGURABILIDAD_TITLE } from '@/data/hogarAsegurabilidad';
import {
  SALUD_ASEGURABILIDAD_KEYS,
  SALUD_ASEGURABILIDAD_QUESTIONS,
  SALUD_ASEGURABILIDAD_TEXT_MAX_LENGTH,
  isSaludQuestionShown,
  type SaludAsegurabilidadKey,
  type SaludAsegurabilidadQuestion,
} from '@/data/saludAsegurabilidad';
import AsegurabilidadSiNoField from './AsegurabilidadSiNoField';

const TOP_LEVEL_QUESTIONS = SALUD_ASEGURABILIDAD_QUESTIONS.filter(q => !('parent' in q));

const followUpsOf = (key: SaludAsegurabilidadKey) =>
  SALUD_ASEGURABILIDAD_QUESTIONS.filter(q => 'parent' in q && q.parent === key);

const isOptional = (q: SaludAsegurabilidadQuestion) => 'optional' in q && q.optional;

const OptionalMark = () => <span className="text-gray-500 dark:text-gray-400"> (opcional)</span>;

// Declaración de asegurabilidad for Seguro de Vida and Seguro de Salud. Follow-up
// questions appear under their question only while it is answered "Sí"; answering
// anything else clears them, so a hidden answer is never validated or sent.
// A "Sí" is informational for the asesor and never blocks the submission.
const SaludAsegurabilidad: React.FC = () => {
  const { control, setValue, clearErrors } = useFormContext();
  const values = useWatch({ control, name: SALUD_ASEGURABILIDAD_KEYS });
  const answers = Object.fromEntries(SALUD_ASEGURABILIDAD_KEYS.map((key, index) => [key, values[index]]));

  const resetFollowUps = (key: SaludAsegurabilidadKey, value: string) => {
    if (value === 'si') return;
    for (const followUp of followUpsOf(key)) {
      setValue(followUp.key, '');
      clearErrors(followUp.key);
    }
  };

  const renderFollowUp = (q: SaludAsegurabilidadQuestion) => {
    if (q.type === 'siNo') {
      return <AsegurabilidadSiNoField key={q.key} name={q.key} question={q.question} optional={isOptional(q)} />;
    }
    return (
      <FormField
        key={q.key}
        control={control}
        name={q.key}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-normal leading-relaxed text-gray-800 dark:text-gray-200">
              {q.question}
              {isOptional(q) && <OptionalMark />}
            </FormLabel>
            <FormControl>
              <Input autoComplete="off" maxLength={SALUD_ASEGURABILIDAD_TEXT_MAX_LENGTH} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  return (
    <fieldset className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
      <legend className="text-base font-semibold">
        {HOGAR_ASEGURABILIDAD_TITLE} <span className="text-red-500">*</span>
      </legend>
      <p className="text-sm text-gray-600 dark:text-gray-400">{HOGAR_ASEGURABILIDAD_DISCLAIMER}</p>

      <ol className="divide-y divide-gray-200 dark:divide-gray-700 rounded-md border border-gray-200 dark:border-gray-700">
        {TOP_LEVEL_QUESTIONS.map((q, index) => {
          const shownFollowUps = followUpsOf(q.key).filter(followUp => isSaludQuestionShown(followUp, answers));
          return (
            <li key={q.key} className="space-y-4 p-4">
              <AsegurabilidadSiNoField
                name={q.key}
                number={`${index + 1}.`}
                question={q.question}
                optional={isOptional(q)}
                onAnswer={value => resetFollowUps(q.key, value)}
              />
              {shownFollowUps.length > 0 && (
                <div className="space-y-4 border-l-2 border-gray-200 pl-4 dark:border-gray-700">
                  {shownFollowUps.map(renderFollowUp)}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </fieldset>
  );
};

export default SaludAsegurabilidad;
