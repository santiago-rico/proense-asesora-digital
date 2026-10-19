/**
 * Declaración de asegurabilidad for Seguro de Vida and Seguro de Salud
 * (emisión form).
 *
 * Single source of truth shared by the form UI, client/server validation, the
 * summary step and the email template, so a question can never be collected
 * without also being validated and emailed. Question text is the insurer's
 * wording verbatim, with only its spelling fixed — do not paraphrase it.
 *
 * Unlike hogar, some questions are follow-ups: they are shown, required and
 * emailed only while their parent is answered "Sí". Answers are informational
 * for the asesor: a "Sí" never blocks the submission. The "¿Cuál o cuáles?"
 * follow-ups are ours, not the insurer's: they ask which diseases a "Sí" to
 * questions 1 and 3 refers to.
 */
export const SALUD_ASEGURABILIDAD_QUESTIONS = [
  {
    key: 'saludDiagnosticos',
    type: 'siNo',
    question: 'Declaro que tengo o he tenido y/o me han diagnosticado: Valvulopatías, Enfermedad Coronaria, Aneurisma, Trasplantes, Reemplazos Articulares, Síndrome de Down, Infarto del Miocardio, Arritmias, Hipertensión Arterial, Colesterol (tratado con medicamentos), Triglicéridos Altos (tratado con medicamentos), Derrames, Isquemia o Trombosis Cerebral, Epilepsia, Enfisema (EPOC), Bronquitis Crónica, Cáncer, Leucemia, Lupus, Tumores Malignos, SIDA o VIH Positivo, Insuficiencia Renal, Esclerosis Múltiple, Artritis Reumatoidea, Diabetes, Pancreatitis, Enfermedad de la Glándula Tiroides, Úlcera Péptica, Colitis, Hepatitis B o C, Cirrosis, Retardo Mental, Trastornos Psiquiátricos, Parálisis, Deformidades Corporales, Ceguera, Sordera Total o Parcial, Asma (siempre y cuando el asma haya sido diagnosticada posterior a los 5 años de edad), Parkinson, Artrosis, Pérdida Anatómica Funcional, Enfermedades de la Sangre, consume(n) Drogas Estimulantes, ha(n) Estado en Tratamiento para Alcoholismo o Drogadicción?',
    shortLabel: 'Diagnóstico de alguna enfermedad de la lista',
  },
  {
    key: 'saludDiagnosticosDetalle',
    type: 'text',
    parent: 'saludDiagnosticos',
    multiline: true,
    question: '¿Cuál o cuáles enfermedades? Si son varios solicitantes, indica a quién corresponde cada una.',
    shortLabel: 'Enfermedades de la lista declaradas',
  },
  {
    key: 'saludCovidUci',
    type: 'siNo',
    question: 'En caso de haber tenido COVID o haber sido diagnosticado con dicha infección, responda: ¿Requirió tratamiento en UCI (unidad de cuidados intensivos) o UCE (unidad de cuidados especiales)? (En caso de NO haber tenido COVID responda NO).',
    shortLabel: 'COVID con tratamiento en UCI o UCE',
  },
  {
    key: 'saludCovidNumeroAsegurado',
    type: 'text',
    parent: 'saludCovidUci',
    optional: true,
    question: 'En caso positivo indique el número de asegurado',
    shortLabel: 'Número de asegurado (COVID)',
  },
  {
    key: 'saludOtrasEnfermedades',
    type: 'siNo',
    question: '¿Alguno de los solicitantes ha tenido enfermedades diferentes a las enunciadas en el numeral 1, fracturas o conmociones cerebrales por las que hayan recibido o estén recibiendo tratamiento médico, tienen programada una intervención quirúrgica en los próximos 6 meses y/o se encuentran en la actualidad bajo estudio médico para el diagnóstico de alguna enfermedad?',
    shortLabel: 'Otras enfermedades, fracturas, cirugías programadas o estudios médicos',
  },
  {
    key: 'saludOtrasEnfermedadesDetalle',
    type: 'text',
    parent: 'saludOtrasEnfermedades',
    multiline: true,
    question: '¿Cuál o cuáles? Describe la enfermedad, fractura, cirugía o estudio médico. Si son varios solicitantes, indica a quién corresponde cada uno.',
    shortLabel: 'Detalle de otras enfermedades, fracturas, cirugías o estudios',
  },
  {
    key: 'saludEmbarazo',
    type: 'siNo',
    question: '¿Alguna de las solicitantes se encuentra en estado de embarazo?',
    shortLabel: 'Embarazo',
  },
  {
    key: 'saludEmbarazoComplicaciones',
    type: 'siNo',
    parent: 'saludEmbarazo',
    question: '¿En caso afirmativo ha tenido complicaciones tales como preeclampsia, eclampsia, diabetes gestacional, amenaza de aborto o sangrado?',
    shortLabel: 'Complicaciones del embarazo',
  },
  {
    // Only women answer it, so it may be left blank; its follow-ups are
    // required once it is answered "Sí".
    key: 'saludCitologia',
    type: 'siNo',
    optional: true,
    question: 'En caso de ser mujer, ¿Se ha practicado citología?',
    shortLabel: 'Citología practicada',
    // Having had a citología is not a risk; only its follow-ups are flagged.
    noFlag: true,
  },
  {
    key: 'saludCitologiaAlteraciones',
    type: 'siNo',
    parent: 'saludCitologia',
    question: '¿El resultado de la última citología presentó alteraciones?',
    shortLabel: 'Alteraciones en la última citología',
  },
  {
    key: 'saludCitologiaMasDeUnAno',
    type: 'siNo',
    parent: 'saludCitologia',
    question: '¿La citología fue practicada hace más de un año?',
    shortLabel: 'Última citología hace más de un año',
  },
  {
    key: 'saludExclusionExtraprima',
    type: 'siNo',
    question: '¿Alguno de los solicitantes tiene en su contrato de Medicina Prepagada o Póliza de Salud algún anexo de exclusión o extraprima?',
    shortLabel: 'Exclusión o extraprima en medicina prepagada o póliza de salud',
  },
] as const satisfies readonly SaludAsegurabilidadQuestionDef[];

type SaludAsegurabilidadQuestionDef = {
  key: string;
  type: 'siNo' | 'text';
  question: string;
  shortLabel: string;
  /** Shown, required and emailed only while this question is answered "Sí". */
  parent?: string;
  /** May be left blank even while shown. */
  optional?: boolean;
  /** A text answer that may run to several lines: a textarea in the form, a full-width row in the email. */
  multiline?: boolean;
  /** A "Sí" here is not highlighted for the asesor. */
  noFlag?: boolean;
};

export type SaludAsegurabilidadQuestion = typeof SALUD_ASEGURABILIDAD_QUESTIONS[number];

export type SaludAsegurabilidadKey = SaludAsegurabilidadQuestion['key'];

export const SALUD_ASEGURABILIDAD_KEYS: SaludAsegurabilidadKey[] =
  SALUD_ASEGURABILIDAD_QUESTIONS.map(q => q.key);

/** The Sí/No questions; the rest are free text. */
export const SALUD_ASEGURABILIDAD_SI_NO_KEYS: SaludAsegurabilidadKey[] =
  SALUD_ASEGURABILIDAD_QUESTIONS.filter(q => q.type === 'siNo').map(q => q.key);

/** Longest accepted free-text answer. */
export const SALUD_ASEGURABILIDAD_TEXT_MAX_LENGTH = 500;

/** The tipoSeguro values whose emisión form asks this declaración de asegurabilidad. */
export const SALUD_ASEGURABILIDAD_RAMOS = ['vida', 'salud'] as const;

export const requiresSaludAsegurabilidad = (tipoSeguro: string | undefined): boolean =>
  (SALUD_ASEGURABILIDAD_RAMOS as readonly string[]).includes(tipoSeguro ?? '');

type SaludAsegurabilidadAnswers = Partial<Record<SaludAsegurabilidadKey, string | undefined>>;

/** Whether a question is shown: top-level ones always, follow-ups while their parent is "Sí". */
export const isSaludQuestionShown = (
  question: SaludAsegurabilidadQuestion,
  answers: SaludAsegurabilidadAnswers,
): boolean => !('parent' in question) || answers[question.parent] === 'si';

/** The questions the client sees given their answers, in order. */
export const getShownSaludQuestions = (answers: SaludAsegurabilidadAnswers): SaludAsegurabilidadQuestion[] =>
  SALUD_ASEGURABILIDAD_QUESTIONS.filter(q => isSaludQuestionShown(q, answers));

/**
 * Keys of the shown, required questions that are not answered — the one rule
 * client and server validation share. A Sí/No question needs "si" or "no", a
 * text question some non-blank text.
 */
export const getMissingSaludAnswers = (answers: SaludAsegurabilidadAnswers): SaludAsegurabilidadKey[] =>
  getShownSaludQuestions(answers)
    .filter(q => !('optional' in q && q.optional))
    .filter(q => q.type === 'siNo'
      ? answers[q.key] !== 'si' && answers[q.key] !== 'no'
      : !answers[q.key]?.trim())
    .map(q => q.key);

/** Whether a "Sí" to this question is highlighted for the asesor. */
export const isSaludFlagged = (question: SaludAsegurabilidadQuestion, answer: string | undefined): boolean =>
  question.type === 'siNo' && answer === 'si' && !('noFlag' in question && question.noFlag);
