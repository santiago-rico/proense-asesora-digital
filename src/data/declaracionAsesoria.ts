/**
 * Declaración de Asesoría y Conformidad del Cliente (emisión form, every ramo).
 *
 * Single source of truth shared by the summary step, client/server validation
 * and the email template, so the client accepts exactly the text that is
 * emailed as the record of their acceptance. The wording is Proense's sales
 * methodology text — do not paraphrase it.
 */
export const DECLARACION_ASESORIA_TITLE = 'Declaración de Asesoría y Conformidad del Cliente';

export const DECLARACION_ASESORIA_INTRO = 'Manifiesto expresamente que:';

export const DECLARACION_ASESORIA_POINTS = [
  'He recibido una asesoría integral, clara y suficiente por parte del asesor comercial de Proense Agencia de Seguros LTDA.',
  'Se me han explicado detalladamente el alcance de cada una de las coberturas contratadas, así como sus exclusiones, períodos de carencia, límites y condiciones de la póliza.',
  'Entiendo y acepto las condiciones informadas en esta solicitud de aseguramiento de manera transparente y a mi entera conformidad.',
] as const;

export const DECLARACION_ASESORIA_CHECKBOX_LABEL =
  'He leído y acepto la Declaración de Asesoría y Conformidad del Cliente';

export const DECLARACION_ASESORIA_REQUIRED_MESSAGE =
  'Debes aceptar la Declaración de Asesoría y Conformidad del Cliente para continuar.';
