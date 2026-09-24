/**
 * Declaración de asegurabilidad for Seguro de Hogar (emisión form).
 *
 * Single source of truth shared by the form UI, client/server validation, the
 * summary step and the email template, so a question can never be collected
 * without also being validated and emailed. Question text is the insurer's
 * wording verbatim — do not paraphrase it.
 *
 * Answers are informational for the asesor: a "Sí" never blocks the submission.
 */
export const HOGAR_ASEGURABILIDAD_QUESTIONS = [
  {
    key: 'hogarPiscina',
    question: '¿Tu hogar cuenta con piscina propia? (Para este caso no se considera piscinas aquellas desarmables, lonas o portátiles)',
    shortLabel: 'Piscina propia',
  },
  {
    key: 'hogarMaterialesNoConvencionales',
    question: '¿Tu hogar se encuentra construido con materiales como: guadua, caña, paja, esterilla, palma, bahareque, tapia, madera o paneles prefabricados?',
    shortLabel: 'Materiales como guadua, bahareque o madera',
  },
  {
    key: 'hogarEnConstruccion',
    question: '¿Tu hogar se encuentra en proceso de construcción o montaje?',
    shortLabel: 'En construcción o montaje',
  },
  {
    key: 'hogarPatrimonio',
    question: '¿Tu hogar es considerado patrimonio artístico, cultural o histórico?',
    shortLabel: 'Patrimonio artístico, cultural o histórico',
  },
  {
    key: 'hogarRiesgoTerreno',
    question: '¿El predio de la ubicación indicada presenta hundimientos, deslizamientos, inundaciones, avalanchas o desprendimiento de rocas?',
    shortLabel: 'Hundimientos, deslizamientos o inundaciones en el predio',
  },
  {
    key: 'hogarFisurasHumedad',
    question: '¿En la estructura de la ubicación indicada se evidencian fisuras, grietas, levantamiento de paredes y humedades?',
    shortLabel: 'Fisuras, grietas o humedades en la estructura',
  },
  {
    key: 'hogarDanoSismico',
    question: '¿El inmueble ha sufrido afectaciones estructurales derivadas de sismos, terremotos, movimientos de tierra o eventos geológicos, incluyendo grietas estructurales, asentamientos diferenciales, deformaciones o daños en muros, columnas y vigas, entre otros?',
    shortLabel: 'Afectaciones estructurales por sismos o eventos geológicos',
  },
] as const;

export type HogarAsegurabilidadKey = typeof HOGAR_ASEGURABILIDAD_QUESTIONS[number]['key'];

export const HOGAR_ASEGURABILIDAD_KEYS: HogarAsegurabilidadKey[] =
  HOGAR_ASEGURABILIDAD_QUESTIONS.map(q => q.key);

export const HOGAR_ASEGURABILIDAD_TITLE = 'Declaración de asegurabilidad';

export const HOGAR_ASEGURABILIDAD_DISCLAIMER =
  'Responde con veracidad; una declaración inexacta puede afectar la validez de tu póliza.';

export const HOGAR_ASEGURABILIDAD_REQUIRED_MESSAGE = 'Responde esta pregunta.';
