import React from 'react';
import {
  HOGAR_ASEGURABILIDAD_DISCLAIMER,
  HOGAR_ASEGURABILIDAD_TITLE,
  getAsegurabilidadQuestions,
  type AsegurabilidadRamo,
} from '@/data/hogarAsegurabilidad';
import AsegurabilidadSiNoField from './AsegurabilidadSiNoField';

interface HogarAsegurabilidadProps {
  ramo: AsegurabilidadRamo;
}

// Declaración de asegurabilidad for Seguro de Hogar and Seguro Empresarial,
// each with its own wording. Every question must be answered, but nothing is
// preselected: the client has to declare each answer. A "Sí" is informational
// for the asesor and never blocks the submission.
const HogarAsegurabilidad: React.FC<HogarAsegurabilidadProps> = ({ ramo }) => (
  <fieldset className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
    <legend className="text-base font-semibold">
      {HOGAR_ASEGURABILIDAD_TITLE} <span className="text-red-500">*</span>
    </legend>
    <p className="text-sm text-gray-600 dark:text-gray-400">{HOGAR_ASEGURABILIDAD_DISCLAIMER}</p>

    <ol className="divide-y divide-gray-200 dark:divide-gray-700 rounded-md border border-gray-200 dark:border-gray-700">
      {getAsegurabilidadQuestions(ramo).map((q, index) => (
        <li key={q.key} className="p-4">
          <AsegurabilidadSiNoField name={q.key} number={`${index + 1}.`} question={q.question} />
        </li>
      ))}
    </ol>
  </fieldset>
);

export default HogarAsegurabilidad;
