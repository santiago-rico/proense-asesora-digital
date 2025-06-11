export interface InsuranceProductData {
  id: string;
  title: string;
  shortDescription: string; // Used for cards or brief mentions
  heroImage: string;
  heroImagePosition?: string;
  heroDescription: string;
  heroCtaText: string;
  explanationTitle: string;
  explanationText: string;
  whoIsItForText: string;
  coveragesTitle: string;
  coverages: Array<{
    icon?: string; // Optional: Lucide icon name or path to custom icon
    title: string;
    description?: string;
  }>;
  coveragesCtaText?: string; // Optional CTA after coverages
  features?: Array<{
    icon?: string;
    title: string;
    description?: string;
  }>; // Kept for additional distinct points if needed
  faq?: Array<{
    question: string;
    answer: string;
  }>;
  leadFormTitle: string;
  leadFormSubtitle: string;
  contactSectionTitle?: string;
  contactSectionSubtitle?: string;
  contactSectionCtaText?: string;
  secondaryBenefitsTitle?: string;
  secondaryBenefitsSubtitle?: string;
  secondaryBenefits?: Array<{
    text: string;
    icon?: string; // Lucide icon name, defaults to Check
  }>;
}

export const insuranceProductsData: Record<string, InsuranceProductData> = {
  vida: {
    id: "vida",
    title: "Seguro de Vida",
    shortDescription: "Protege a tus seres queridos y garantiza su futuro financiero.",
    heroImage: "/images/hero-vida.jpg",
    heroImagePosition: 'center 10%',
    heroDescription: "Asegura la tranquilidad de tu familia ante cualquier eventualidad. Un seguro de vida es un acto de amor y responsabilidad que garantiza su bienestar económico incluso cuando ya no estés.",
    heroCtaText: "Calcula tu Seguro de Vida",
    explanationTitle: "¿Qué es el Seguro de Vida?",
    explanationText: "El seguro de vida es un contrato mediante el cual la aseguradora se compromete a pagar una suma de dinero (capital asegurado) a los beneficiarios designados en caso de fallecimiento del asegurado. También puede ofrecer coberturas adicionales por invalidez, enfermedades graves o accidentes.",
    whoIsItForText: "Este seguro es ideal para personas que son el principal sostén económico de su familia, padres con hijos pequeños, personas con deudas importantes (como hipotecas) o cualquiera que desee dejar un legado financiero y proteger a sus seres queridos de dificultades económicas.",
    coveragesTitle: "Principales Coberturas del Seguro de Vida",
    coverages: [
      {
        icon: "HeartHandshake",
        title: "Fallecimiento por cualquier causa",
        description: "Garantiza el pago del capital asegurado a tus beneficiarios si falleces, sin importar la causa (con excepciones contractuales habituales)."
      },
      {
        icon: "Accessibility",
        title: "Invalidez Absoluta y Permanente",
        description: "Recibe el capital asegurado en vida si sufres una invalidez que te impida desempeñar cualquier actividad laboral."
      },
      {
        icon: "Activity",
        title: "Enfermedades Graves",
        description: "Opción de recibir un anticipo del capital asegurado en caso de diagnóstico de enfermedades graves especificadas en la póliza."
      },
      {
        icon: "ShieldCheck",
        title: "Doble Capital por Accidente",
        description: "Tus beneficiarios podrían recibir el doble del capital asegurado si el fallecimiento ocurre como resultado de un accidente."
      }
    ],
    coveragesCtaText: "Quiero saber más sobre coberturas",
    faq: [
      {
        question: "¿Quiénes pueden ser mis beneficiarios?",
        answer: "Puedes designar a cualquier persona como beneficiario: cónyuge, hijos, padres, hermanos, o incluso amigos o instituciones. Puedes cambiar los beneficiarios cuando lo desees."
      },
      {
        question: "¿Hasta qué edad puedo contratar un seguro de vida?",
        answer: "La edad máxima de contratación varía según la aseguradora y el tipo de póliza, pero generalmente se sitúa entre los 65 y 70 años. Algunas pólizas pueden tener edades de cobertura vitalicia."
      },
      {
        question: "¿Qué pasa si dejo de pagar las primas?",
        answer: "Si dejas de pagar, la póliza puede cancelarse y perderías la cobertura. Algunas pólizas ofrecen opciones como el rescate del valor acumulado o la conversión a un seguro saldado por un capital menor."
      }
    ],
    leadFormTitle: "Obtén tu cotización de Seguro de Vida",
    leadFormSubtitle: "Completa el formulario y un asesor especializado te contactará para ofrecerte la mejor solución adaptada a tus necesidades y presupuesto.",
    contactSectionTitle: "¿Prefieres hablar directamente con un asesor?",
    contactSectionSubtitle: "Estamos disponibles para resolver todas tus dudas sobre seguros de vida.",
    contactSectionCtaText: "Contacta con un experto",
    secondaryBenefitsTitle: "Beneficios Adicionales Pensados para Ti",
    secondaryBenefitsSubtitle: "Más allá de la protección económica, te ofrecemos servicios de valor.",
    secondaryBenefits: [
      { text: "Asesoramiento legal y fiscal sobre la herencia.", icon: "Landmark" },
      { text: "Gestión de trámites de sepelio y últimas voluntades.", icon: "ClipboardList" },
      { text: "Adelanto de capital para gastos urgentes.", icon: "DollarSign" },
      { text: "Apoyo psicológico para beneficiarios.", icon: "HeartHandshake" }
    ]
  },
  salud: {
    id: "salud",
    title: "Seguro de Salud",
    shortDescription: "Accede a la mejor atención médica privada para ti y tu familia.",
    heroImage: "/images/hero-salud.jpg",
    heroImagePosition: 'center 70%',
    heroDescription: "Tu bienestar y el de tu familia es lo más importante. Con nuestro seguro de salud, accede a una amplia red de profesionales y centros médicos de primer nivel, sin listas de espera.",
    heroCtaText: "Descubre Planes de Salud",
    explanationTitle: "¿En qué consiste el Seguro de Salud Privado?",
    explanationText: "Un seguro de salud privado te da acceso a servicios médicos y hospitalarios fuera del sistema público. Cubre consultas, pruebas diagnósticas, tratamientos, intervenciones quirúrgicas y hospitalización, según las condiciones de la póliza contratada. El objetivo es ofrecer una atención ágil, personalizada y de calidad.",
    whoIsItForText: "Es ideal para individuos y familias que buscan una alternativa o complemento a la sanidad pública, desean evitar listas de espera, tener acceso a especialistas de forma rápida, y elegir médicos y centros. También es muy valorado por autónomos y empresas para sus empleados.",
    coveragesTitle: "Coberturas Destacadas del Seguro de Salud",
    coverages: [
      {
        icon: "Stethoscope",
        title: "Atención Primaria y Especialistas",
        description: "Acceso a médicos de cabecera, pediatras y una amplia gama de especialistas sin necesidad de pasar primero por el médico general en muchos casos."
      },
      {
        icon: "TestTube2",
        title: "Pruebas Diagnósticas y Tratamientos",
        description: "Cobertura para análisis clínicos, radiografías, resonancias, TACs, y tratamientos ambulatorios y hospitalarios."
      },
      {
        icon: "BedDouble",
        title: "Hospitalización e Intervenciones Quirúrgicas",
        description: "Cubre los gastos de estancia hospitalaria, habitación individual (según póliza), quirófano, anestesia y honorarios médicos."
      },
      {
        icon: "Baby",
        title: "Cobertura Dental y de Visión (Opcional)",
        description: "Muchos seguros ofrecen módulos adicionales para cubrir gastos dentales, oftalmológicos y otros servicios de bienestar."
      }
    ],
    faq: [
      {
        question: "¿Qué son los copagos?",
        answer: "El copago es una pequeña cantidad de dinero que el asegurado paga al utilizar algunos servicios médicos. No todos los seguros tienen copagos; existen pólizas sin copago, con copago bajo, medio o alto, lo que influye en la prima mensual."
      },
      {
        question: "¿Existen periodos de carencia?",
        answer: "Sí, el periodo de carencia es un tiempo que debe transcurrir desde la contratación de la póliza hasta que puedes utilizar ciertos servicios (ej. hospitalización programada, parto). Urgencias vitales suelen estar cubiertas desde el primer día."
      },
      {
        question: "¿Puedo incluir a mi familia en mi póliza?",
        answer: "Sí, la mayoría de las aseguradoras ofrecen pólizas familiares que permiten incluir a tu cónyuge e hijos, a menudo con primas más ventajosas que las individuales."
      }
    ],
    leadFormTitle: "Encuentra tu Seguro de Salud Ideal",
    leadFormSubtitle: "Déjanos tus datos y te ayudaremos a comparar opciones para que elijas el seguro de salud que mejor se adapte a ti y a tu familia.",
    contactSectionTitle: "¿Tienes dudas sobre qué seguro de salud elegir?",
    contactSectionSubtitle: "Nuestros asesores están listos para ayudarte a encontrar la mejor cobertura.",
    contactSectionCtaText: "Habla con un especialista",
    secondaryBenefitsTitle: "Asistencia Completa en tu Salud",
    secondaryBenefitsSubtitle: "Beneficios adicionales para tu bienestar.",
    secondaryBenefits: [
      { text: "Acceso a segunda opinión médica.", icon: "Users" },
      { text: "Servicios de telemedicina.", icon: "MonitorSmartphone" },
      { text: "Descuentos en servicios de bienestar.", icon: "Smile" },
      { text: "Programas de prevención.", icon: "Activity" }
    ]
  },
  auto: {
    id: "auto",
    title: "Seguro de Auto",
    shortDescription: "Cobertura completa para tu vehículo ante cualquier eventualidad.",
    heroImage: "/images/hero-auto.jpg",
    heroImagePosition: 'left',
    heroDescription: "Conduce con la tranquilidad de estar protegido. Te ofrecemos seguros de auto con las coberturas que necesitas para que solo te preocupes de disfrutar el camino.",
    heroCtaText: "Cotiza tu Seguro de Auto",
    explanationTitle: "¿Qué es el Seguro de Auto?",
    explanationText: "Es un contrato que te protege económicamente ante los riesgos asociados a la conducción y tenencia de un vehículo, como accidentes, robos o daños a terceros.",
    whoIsItForText: "Es obligatorio para todos los propietarios de vehículos a motor. Las coberturas pueden variar desde la responsabilidad civil básica hasta todo riesgo.",
    coveragesTitle: "Principales Coberturas de Auto",
    coverages: [
      {
        icon: "CarCrash",
        title: "Responsabilidad Civil Obligatoria y Voluntaria",
        description: "Cubre los daños materiales y personales que puedas causar a terceros en un accidente. Es la cobertura esencial y legalmente obligatoria."
      },
      {
        icon: "ShieldCheck",
        title: "Daños Propios (Todo Riesgo)",
        description: "Reparamos los daños de tu propio vehículo, incluso si eres el culpable del siniestro. Incluye colisión, vandalismo y más."
      },
      {
        icon: "Flame",
        title: "Robo, Incendio y Lunas",
        description: "Te indemnizamos por el robo del vehículo o los daños sufridos en el intento, así como por incendios y la rotura de las lunas."
      },
      {
        icon: "Wrench",
        title: "Asistencia en Viaje",
        description: "Soporte en carretera 24/7 desde el km 0, incluyendo grúa, reparación in-situ y ayuda en caso de pinchazo o falta de batería."
      },
      {
        icon: "Gavel",
        title: "Defensa Jurídica y Reclamación de Daños",
        description: "Cubre los gastos de tu defensa legal y te ayudamos a reclamar los daños sufridos en un accidente del que no eres responsable."
      },
      {
        icon: "Car",
        title: "Vehículo de Sustitución",
        description: "Dispondrás de un coche de sustitución mientras el tuyo está en el taller por avería o accidente, para que no pierdas tu movilidad."
      }
    ],
    leadFormTitle: "Calcula el precio de tu Seguro de Auto",
    leadFormSubtitle: "Obtén una comparativa personalizada y elige la mejor opción para tu vehículo.",
    secondaryBenefitsTitle: "Asistencia Completa en Carretera y Más Allá",
    secondaryBenefitsSubtitle: "Beneficios exclusivos para que conduzcas con total tranquilidad.",
    secondaryBenefits: [
      { text: "Asistencia en carretera desde km 0, 24/7 (grúa, reparación in situ).", icon: "Wrench" },
      { text: "Vehículo de sustitución en caso de avería o accidente.", icon: "Car" },
      { text: "Gestión de multas y asesoramiento legal.", icon: "Gavel" },
      { text: "Revisión anual de puntos de seguridad del vehículo.", icon: "ShieldCheck" }
    ]
  },
  hogar: {
    id: "hogar",
    title: "Seguro de Hogar",
    shortDescription: "Protege tu hogar y tus pertenencias contra daños y robos.",
    heroImage: "/images/hero-hogar.jpg",
    heroImagePosition: 'center',
    heroDescription: "Tu casa es tu mayor inversión. Asegura tu tranquilidad y la de tu familia con un seguro de hogar que cubra desde el continente hasta el contenido.",
    heroCtaText: "Compara Seguros de Hogar",
    explanationTitle: "¿Por qué necesitas un Seguro de Hogar?",
    explanationText: "Un seguro de hogar protege tu vivienda y tus bienes ante imprevistos como incendios, robos, daños por agua, roturas o responsabilidad civil si causas daños a terceros.",
    whoIsItForText: "Esencial para propietarios de viviendas, ya sean habituales, secundarias o en alquiler. También para inquilinos que quieran proteger su contenido.",
    coveragesTitle: "Coberturas Esenciales del Seguro de Hogar",
    coverages: [
      {
        icon: "Home",
        title: "Daños al Continente y Contenido",
        description: "Protección completa contra incendios, inundaciones, robos y otros daños que puedan afectar la estructura de tu vivienda y tus pertenencias."
      },
      {
        icon: "ShieldAlert",
        title: "Responsabilidad Civil",
        description: "Cubre los daños materiales o personales que tú o tu familia podáis causar accidentalmente a terceros, tanto dentro como fuera de casa."
      },
      {
        icon: "KeyRound",
        title: "Robo, Hurto y Vandalismo",
        description: "Te indemnizamos por los bienes sustraídos en un robo y reparamos los daños ocasionados en la vivienda, incluyendo cerraduras."
      },
      {
        icon: "GlassWater",
        title: "Daños por Agua y Roturas",
        description: "Cubre la reparación de tuberías, goteras, y la rotura accidental de cristales, espejos, sanitarios o placas vitrocerámicas."
      }
    ],
    leadFormTitle: "Encuentra el Mejor Seguro para tu Hogar",
    leadFormSubtitle: "Te ayudamos a proteger lo que más importa. Solicita tu estudio gratuito.",
    secondaryBenefitsTitle: "Tu Hogar, Siempre Protegido y Conectado",
    secondaryBenefitsSubtitle: "Servicios que van más allá de la cobertura básica para tu tranquilidad.",
    secondaryBenefits: [
      { text: "Servicio de manitas en casa para pequeñas reparaciones.", icon: "Home" },
      { text: "Asistencia informática remota para tus dispositivos.", icon: "Laptop" },
      { text: "Defensa jurídica y reclamación de daños.", icon: "Scale" },
      { text: "Servicio de control de plagas.", icon: "Bug" }
    ]
  },
  pymes: {
    id: "pymes",
    title: "Seguro para PYMES",
    shortDescription: "Soluciones personalizadas para proteger tu negocio.",
    heroImage: "/images/hero-pymes.jpg",
    heroImagePosition: 'center',
    heroDescription: "Tu empresa es el motor de tu futuro. Asegura su continuidad y crecimiento con un seguro para PYMES adaptado a los riesgos específicos de tu actividad.",
    heroCtaText: "Protege tu Negocio",
    explanationTitle: "¿Qué cubre un Seguro para PYMES?",
    explanationText: "Los seguros para PYMES ofrecen un conjunto de coberturas para proteger el patrimonio de la empresa (instalaciones, maquinaria, existencias) y su responsabilidad ante reclamaciones de terceros.",
    whoIsItForText: "Para pequeñas y medianas empresas de cualquier sector que quieran asegurar sus activos, cubrir su responsabilidad civil y garantizar la continuidad del negocio.",
    coveragesTitle: "Coberturas Clave para tu PYME",
    coverages: [
      {
        icon: "Building2",
        title: "Daños Materiales al Patrimonio",
        description: "Protege tus oficinas, naves, maquinaria y existencias contra incendios, robos, inundaciones y otros daños materiales."
      },
      {
        icon: "Users",
        title: "Responsabilidad Civil de Explotación",
        description: "Cubre las indemnizaciones por daños materiales o personales que tu empresa pueda causar a terceros en el desarrollo de su actividad."
      },
      {
        icon: "TrendingDown",
        title: "Pérdida de Beneficios / Paralización de Actividad",
        description: "Te compensamos por la pérdida de ingresos y los gastos fijos si tu negocio debe detenerse a causa de un siniestro cubierto."
      },
      {
        icon: "HardHat",
        title: "Responsabilidad Civil Patronal y de Productos",
        description: "Protección frente a reclamaciones por accidentes laborales de tus empleados o por daños causados por los productos que vendes."
      }
    ],
    leadFormTitle: "Asesoramiento experto para el Seguro de tu PYME",
    leadFormSubtitle: "Analizamos los riesgos de tu negocio y te ofrecemos la solución aseguradora más completa.",
    secondaryBenefitsTitle: "Más que un Seguro, una Gestión Eficaz de tu Negocio",
    secondaryBenefitsSubtitle: "Servicios adicionales para optimizar la rentabilidad y seguridad de tu empresa.",
    secondaryBenefits: [
      { text: "Asesoramiento legal y fiscal.", icon: "Landmark" },
      { text: "Gestión de riesgos y prevención de siniestros.", icon: "ShieldCheck" },
      { text: "Servicio de asistencia técnica.", icon: "Wrench" },
      { text: "Acceso a programas de formación y capacitación.", icon: "Award" }
    ]
  },
  decesos: {
    id: "decesos",
    title: "Seguro de Decesos",
    shortDescription: "Cubre los gastos funerarios y gestiones necesarias.",
    heroImage: "/images/hero-decesos.jpg",
    heroImagePosition: 'center',
    heroDescription: "Evita preocupaciones y cargas económicas a tus seres queridos en momentos difíciles. Un seguro de decesos se encarga de todo.",
    heroCtaText: "Infórmate sobre Seguro de Decesos",
    explanationTitle: "¿Qué es el Seguro de Decesos?",
    explanationText: "Es una póliza que cubre los gastos asociados al sepelio del asegurado, además de ofrecer asistencia a la familia en los trámites y gestiones necesarias tras el fallecimiento.",
    whoIsItForText: "Para personas previsoras que no quieren dejar esta carga económica y emocional a sus familiares.",
    coveragesTitle: "Servicios Incluidos en el Seguro de Decesos",
    coverages: [
      {
        icon: "Church",
        title: "Servicio Funerario Completo",
        description: "Nos encargamos de todos los detalles del servicio fúnebre, incluyendo féretro, tanatorio, flores y coche fúnebre, respetando tus deseos."
      },
      {
        icon: "Plane",
        title: "Traslados y Repatriación",
        description: "Garantizamos el traslado del fallecido desde cualquier lugar del mundo hasta el cementerio o crematorio elegido en España."
      },
      {
        icon: "ClipboardList",
        title: "Gestión de Trámites Burocráticos",
        description: "Un gestor personal se ocupa de todo el papeleo post-mortem, como la obtención de certificados, pensiones y la gestión de últimas voluntades."
      },
      {
        icon: "HeartHandshake",
        title: "Apoyo Psicológico a la Familia",
        description: "Ofrecemos asistencia psicológica especializada para ayudar a tus seres queridos a sobrellevar el duelo en momentos tan difíciles."
      }
    ],
    leadFormTitle: "Planifica con Tranquilidad tu Seguro de Decesos",
    leadFormSubtitle: "Solicita información y te asesoraremos sobre la opción que mejor se ajuste a tus necesidades.",
    secondaryBenefitsTitle: "Asistencia Integral en Momentos Difíciles",
    secondaryBenefitsSubtitle: "Beneficios adicionales para apoyar a tus seres queridos.",
    secondaryBenefits: [
      { text: "Asesoramiento psicológico.", icon: "HeartHandshake" },
      { text: "Servicio de acompañamiento.", icon: "Users" },
      { text: "Gestión de trámites burocráticos.", icon: "ClipboardList" },
      { text: "Acceso a programas de apoyo emocional.", icon: "Smile" }
    ]
  },
  mascotas: {
    id: "mascotas",
    title: "Seguro de Mascotas",
    shortDescription: "Protección completa para tu mascota.",
    heroImage: "/images/hero-mascotas.jpg",
    heroImagePosition: 'center',
    heroDescription: "Descubre la tranquilidad de tener a tu mascota protegida con nuestro seguro especializado.",
    heroCtaText: "Calcula Seguro de Mascota",
    explanationTitle: "¿Qué es el Seguro de Mascotas?",
    explanationText: "Este seguro está diseñado para ofrecerte la máxima cobertura y tranquilidad para tu mascota, cubriendo gastos veterinarios, responsabilidad civil y más.",
    whoIsItForText: "Ideal para todos los dueños de perros y gatos que buscan seguridad y respaldo ante imprevistos y enfermedades de sus compañeros.",
    coveragesTitle: "Principales Coberturas",
    coverages: [
      {
        icon: "Stethoscope",
        title: "Asistencia Veterinaria por Accidente y Enfermedad",
        description: "Cubre consultas, pruebas diagnósticas, cirugías, hospitalización y medicamentos en caso de accidente o enfermedad."
      },
      {
        icon: "ShieldAlert",
        title: "Responsabilidad Civil",
        description: "Protección frente a los daños materiales o personales que tu mascota pueda causar a otras personas, animales u objetos."
      },
      {
        icon: "SearchHeart",
        title: "Robo o Extravío",
        description: "Recibe una indemnización si tu mascota es robada y cubrimos los gastos de inserción de anuncios para encontrarla si se pierde."
      },
      {
        icon: "PhoneCall",
        title: "Asistencia Telefónica Veterinaria",
        description: "Acceso a un servicio de consulta telefónica 24/7 para resolver dudas sobre la salud y el bienestar de tu mascota."
      }
    ],
    coveragesCtaText: "Ver Todas las Coberturas",
    faq: [
      { question: "¿Qué tipo de mascotas cubre el seguro?", answer: "Principalmente perros y gatos, aunque algunas pólizas pueden cubrir otras mascotas exóticas. Consúltanos." },
      { question: "¿Hay límite de edad para asegurar a mi mascota?", answer: "Sí, la mayoría de las aseguradoras tienen límites de edad para la contratación, tanto mínima como máxima." }
    ],
    leadFormTitle: "Solicita Información para tu Seguro de Mascotas",
    leadFormSubtitle: "Uno de nuestros asesores te contactará para ofrecerte la mejor solución para tu fiel amigo.",
    contactSectionTitle: "¿Dudas sobre el Seguro de Mascotas?",
    contactSectionSubtitle: "Estamos aquí para ayudarte a proteger a tu compañero.",
    contactSectionCtaText: "Hablar con un Asesor",
    secondaryBenefitsTitle: "Cuidado Extra para tu Compañero Fiel",
    secondaryBenefitsSubtitle: "Beneficios adicionales para el bienestar y la felicidad de tu mascota.",
    secondaryBenefits: [
      { text: "Consultas veterinarias telefónicas 24/7.", icon: "PhoneCall" },
      { text: "Descuentos en servicios de guardería y adiestramiento.", icon: "Dog" },
      { text: "Servicio de recordatorio de vacunas y desparasitación.", icon: "CalendarCheck" },
      { text: "Asesoramiento nutricional especializado.", icon: "Bone" }
    ]
  },
  motos: {
    id: "motos",
    title: "Seguro de Motos",
    shortDescription: "La mejor protección para ti y tu moto.",
    heroImage: "/images/hero-motos.jpg",
    heroImagePosition: 'center',
    heroDescription: "Disfruta la libertad de la carretera con la seguridad de estar completamente protegido.",
    heroCtaText: "Calcula Seguro de Moto",
    explanationTitle: "¿Qué es el Seguro de Motos?",
    explanationText: "Un seguro de moto te protege frente a los riesgos asociados a la conducción, cubriendo desde la responsabilidad civil obligatoria hasta daños propios, robo o asistencia en viaje.",
    whoIsItForText: "Para cualquier propietario de motocicleta, scooter o ciclomotor que quiera circular con tranquilidad y cumplir con la ley.",
    coveragesTitle: "Coberturas Esenciales para tu Moto",
    coverages: [
      {
        icon: "ShieldCheck",
        title: "Responsabilidad Civil Obligatoria y Voluntaria",
        description: "Te cubre frente a los daños materiales y personales que puedas ocasionar a terceros mientras conduces. Es la cobertura mínima exigida por ley."
      },
      {
        icon: "Bike",
        title: "Daños Propios (Todo Riesgo)",
        description: "Reparamos los daños que sufra tu propia moto en un accidente, seas o no el culpable. Ideal para motos nuevas o de gran valor."
      },
      {
        icon: "Flame",
        title: "Robo e Incendio",
        description: "Recibe una indemnización por el valor de tu moto en caso de robo o por los daños sufridos en un incendio."
      },
      {
        icon: "Wrench",
        title: "Asistencia en Viaje Completa",
        description: "Servicio de grúa y asistencia mecánica desde el km 0, 24/7, para que un pinchazo o avería no arruine tu ruta."
      },
      {
        icon: "UserCheck",
        title: "Seguro del Conductor",
        description: "Garantiza una indemnización para ti en caso de invalidez permanente o para tus herederos en caso de fallecimiento por accidente de moto."
      }
    ],
    faq: [
      { question: "¿Es obligatorio el seguro de moto?", answer: "Sí, como mínimo es obligatorio el seguro de Responsabilidad Civil para poder circular." },
      { question: "¿Qué tipo de seguro de moto me conviene más?", answer: "Depende del uso que le des a tu moto, su antigüedad y tu presupuesto. Podemos asesorarte para encontrar el más adecuado." }
    ],
    leadFormTitle: "Encuentra el Mejor Seguro para tu Moto",
    leadFormSubtitle: "Compara opciones y elige la cobertura perfecta para tus dos ruedas.",
    secondaryBenefitsTitle: "Tu Pasión, Nuestra Prioridad en la Carretera",
    secondaryBenefitsSubtitle: "Ventajas exclusivas para que disfrutes de cada kilómetro con seguridad.",
    secondaryBenefits: [
      { text: "Asistencia en viaje específica para motos (remolque especializado).", icon: "Bike" },
      { text: "Cobertura de equipamiento (casco, chaqueta).", icon: "Shirt" },
      { text: "Cursos de conducción segura con descuento.", icon: "Award" },
      { text: "Guardería de moto en invierno (servicio opcional).", icon: "ParkingCircle" }
    ]
  },
  arrendamiento: {
    id: "arrendamiento",
    title: "Seguro de Impago de Alquiler",
    shortDescription: "Garantiza el cobro de tus rentas y protege tu inversión.",
    heroImage: "/images/hero-arrendamiento.jpg",
    heroImagePosition: 'center',
    heroDescription: "Alquila tu propiedad con total tranquilidad. Nuestro seguro de impago te protege frente a inquilinos morosos y cubre posibles daños.",
    heroCtaText: "Protege tu Alquiler",
    explanationTitle: "¿Qué es el Seguro de Impago de Alquiler?",
    explanationText: "Es una póliza diseñada para propietarios de inmuebles en alquiler. Garantiza el cobro de las rentas mensuales en caso de impago por parte del inquilino y puede cubrir los gastos de desahucio y daños en la vivienda.",
    whoIsItForText: "Para propietarios que desean asegurar sus ingresos por alquiler y protegerse de los riesgos asociados al arrendamiento.",
    coveragesTitle: "Principales Ventajas del Seguro de Alquiler",
    coverages: [
      {
        icon: "Landmark",
        title: "Adelanto de Rentas Impagadas",
        description: "Te garantizamos el cobro de hasta 12 mensualidades de alquiler si tu inquilino deja de pagar, para que no pierdas ingresos."
      },
      {
        icon: "Scale",
        title: "Defensa y Reclamación Jurídica",
        description: "Cubre todos los gastos de abogados y procuradores para el proceso de desahucio y la reclamación de las deudas."
      },
      {
        icon: "Hammer",
        title: "Actos Vandálicos y Daños Malintencionados",
        description: "Reparamos los daños malintencionados que el inquilino pueda causar en la vivienda, tanto en el continente como en el contenido."
      },
      {
        icon: "FileSearch2",
        title: "Estudio de Solvencia de Inquilinos",
        description: "Realizamos un análisis de viabilidad del candidato a inquilino para asegurar su solvencia y minimizar los riesgos desde el principio."
      }
    ],
    faq: [
      { question: "¿Quién paga el seguro de impago de alquiler?", answer: "Generalmente lo contrata y paga el propietario del inmueble." },
      { question: "¿Qué requisitos debe cumplir el inquilino?", answer: "La aseguradora realizará un estudio de solvencia del inquilino para aprobar la póliza." }
    ],
    leadFormTitle: "Asegura tus Ingresos por Alquiler",
    leadFormSubtitle: "Infórmate sobre cómo proteger tu inversión inmobiliaria.",
    secondaryBenefitsTitle: "Más que un Seguro, una Gestión Eficaz de tu Alquiler",
    secondaryBenefitsSubtitle: "Servicios adicionales para optimizar la rentabilidad y seguridad de tu propiedad.",
    secondaryBenefits: [
      { text: "Selección de inquilinos y estudio de solvencia avanzado.", icon: "UserCheck" },
      { text: "Gestión de contratos y asesoramiento legal continuo.", icon: "FileSignature" },
      { text: "Servicio de mediación en caso de conflictos con el inquilino.", icon: "Users" },
      { text: "Mantenimiento y reparaciones urgentes en la vivienda.", icon: "Wrench" }
    ]
  },
  viaje: {
    id: "viaje",
    title: "Seguro de Viaje",
    shortDescription: "Viaja con total tranquilidad y cobertura mundial.",
    heroImage: "/images/hero-viaje.jpg",
    heroImagePosition: 'center',
    heroDescription: "Explora el mundo sin preocupaciones. Nuestro seguro de viaje te protege ante cualquier imprevisto, estés donde estés.",
    heroCtaText: "Asegura tu Aventura",
    explanationTitle: "¿Por qué necesitas un Seguro de Viaje?",
    explanationText: "Un seguro de viaje te cubre ante eventualidades como gastos médicos por enfermedad o accidente, cancelación del viaje, pérdida de equipaje, repatriación y responsabilidad civil en el extranjero.",
    whoIsItForText: "Para cualquier persona que viaje, ya sea por ocio o trabajo, tanto a destinos nacionales como internacionales.",
    coveragesTitle: "Coberturas Imprescindibles en tu Viaje",
    coverages: [
      { icon: "PlaneTakeoff", title: "Asistencia Médica y Sanitaria", description: "Cobertura de gastos médicos, hospitalización y medicamentos en el extranjero." },
      { icon: "Luggage", title: "Pérdida, Robo o Daño de Equipaje", description: "Indemnización por problemas con tus pertenencias." },
      { icon: "FileX2", title: "Cancelación o Interrupción del Viaje", description: "Reembolso de gastos si no puedes viajar o tienes que regresar antes." },
      { icon: "Globe", title: "Repatriación Sanitaria y Fallecimiento", description: "Traslado a tu país de origen en caso de necesidad." },
      { icon: "ShieldCheck", title: "Responsabilidad Civil Privada", description: "Cubre los daños que puedas causar a terceros durante tu viaje." }
    ],
    faq: [
      { question: "¿Cuándo debo contratar el seguro de viaje?", answer: "Lo ideal es contratarlo al mismo tiempo que reservas tu viaje para estar cubierto ante posibles cancelaciones previas." },
      { question: "¿El seguro de viaje cubre deportes de aventura?", answer: "Algunas pólizas ofrecen coberturas específicas para deportes de aventura. Es importante verificarlo y contratar la opción adecuada." }
    ],
    leadFormTitle: "Viaja Seguro y sin Preocupaciones",
    leadFormSubtitle: "Obtén tu presupuesto de seguro de viaje personalizado en minutos.",
    secondaryBenefitsTitle: "Tu Aventura Global, Cubierta al Detalle",
    secondaryBenefitsSubtitle: "Beneficios que te acompañan para que solo te preocupes de disfrutar.",
    secondaryBenefits: [
      { text: "Asistencia médica 24/7 en tu idioma, estés donde estés.", icon: "Globe2" },
      { text: "Adelanto de fondos en caso de robo o pérdida de tarjeta.", icon: "CreditCard" },
      { text: "Información sobre visados y vacunas necesarias.", icon: "Info" },
      { text: "Servicio de localización y envío de equipaje extraviado.", icon: "Luggage" }
    ]
  }
};
