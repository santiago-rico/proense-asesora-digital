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
  whoIsItFor: Array<{ persona: string; description: string; }>;
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

}

export const insuranceProductsData: Record<string, InsuranceProductData> = {
  vida: {
    id: "vida",
    title: "Seguro de Vida",
    shortDescription: "Protege a tus seres queridos y garantiza su futuro financiero.",
    heroImage: "/images/hero-vida.jpg",
    heroImagePosition: 'center 10%',
    heroDescription: "Garantiza el futuro financiero de tu familia y vive con la tranquilidad de saber que están protegidos. Nosotros te ayudamos a hacerlo simple.",
    heroCtaText: "Solicitar Asesoría Gratuita",
    explanationTitle: "¿Qué es el Seguro de Vida?",
    explanationText: "El seguro de vida es un contrato mediante el cual la aseguradora se compromete a pagar una suma de dinero (capital asegurado) a los beneficiarios designados en caso de fallecimiento del asegurado. También puede ofrecer coberturas adicionales por invalidez, enfermedades graves o accidentes.",
    whoIsItFor: [
      { persona: "Padres y madres de familia", description: "Asegura la educación y el bienestar de tus hijos, garantizando que tus metas para ellos se cumplan sin importar lo que pase." },
      { persona: "Jóvenes profesionales con deudas", description: "Protege tu patrimonio y evita dejar cargas financieras a tus seres queridos, como créditos hipotecarios o estudiantiles." },
      { persona: "Socios y dueños de negocios", description: "Garantiza la continuidad de tu empresa y protege a tus socios o familiares ante tu ausencia inesperada." },
      { persona: "Personas previsoras", description: "Crea un legado financiero sólido y planifica tu futuro con una herramienta que te brinda tranquilidad y respaldo." }
    ],
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
      },
      {
        icon: "BookUser",
        title: "Auxilio Funerario",
        description: "Un respaldo económico para cubrir los gastos funerarios, aliviando la carga financiera de tus seres queridos en un momento difícil."
      },
      {
        icon: "Hospital",
        title: "Renta Diaria por Hospitalización",
        description: "Recibe un ingreso diario en caso de ser hospitalizado por accidente o enfermedad, ayudándote a cubrir gastos imprevistos."
      }
    ],
    coveragesCtaText: "Explora Todas las Coberturas",
    faq: [
      {
        question: "¿Quiénes pueden ser mis beneficiarios?",
        answer: "Puedes designar a cualquier persona como beneficiario: cónyuge, hijos, padres, hermanos, o incluso amigos o instituciones. Es importante revisar y actualizar los beneficiarios periódicamente."
      },
      {
        question: "¿Hasta qué edad puedo contratar un seguro de vida?",
        answer: "La edad máxima de contratación varía, pero suele estar entre los 65 y 70 años. Algunas pólizas ofrecen cobertura vitalicia si se contratan antes de cierta edad."
      },
      {
        question: "¿Qué pasa si dejo de pagar las primas?",
        answer: "Si dejas de pagar, la póliza puede cancelarse y perderías la cobertura. Algunas ofrecen opciones como el rescate del valor acumulado o la conversión a un seguro saldado por un capital menor. Consulta las condiciones de tu póliza."
      },
      {
        question: "¿Puedo modificar mi póliza de seguro de vida una vez contratada?",
        answer: "Sí, la mayoría de las pólizas de seguro de vida ofrecen flexibilidad. Puedes solicitar cambios como el aumento o disminución del capital asegurado, la modificación de beneficiarios o la inclusión de coberturas adicionales, sujeto a las condiciones de la aseguradora y una nueva evaluación del riesgo."
      },
      {
        question: "¿Cuánta cobertura de seguro de vida necesito realmente?",
        answer: "Una regla general es asegurar un capital entre 5 y 7 veces tus ingresos anuales. Sin embargo, lo ideal es hacer un cálculo personalizado que considere tus deudas (como hipotecas), los gastos futuros de educación de tus hijos y el tiempo que tu familia necesitaría para estabilizarse financieramente. Nuestro equipo te ayuda a calcular la cifra exacta para tus necesidades."
      },
      {
        question: "¿Cuál es la diferencia entre un seguro de vida temporal y uno permanente?",
        answer: "Un seguro temporal te cubre por un período específico (ej. 10, 20 años), ideal para proteger necesidades con fecha de caducidad como un crédito. Un seguro permanente te cubre de por vida y además puede generar un valor de ahorro (valor de rescate) que puedes usar en el futuro. Te ayudamos a decidir cuál se adapta mejor a tu momento de vida."
      },
      {
        question: "¿Qué es el 'valor de rescate' de una póliza y cómo funciona?",
        answer: "El valor de rescate es un componente de ahorro que se acumula en los seguros de vida permanentes. Este dinero está disponible para ti si decides cancelar la póliza, o puedes usarlo para pedir un préstamo a la aseguradora. Es una forma de proteger a tu familia y a la vez construir un capital para tu futuro."
      },
      {
        question: "¿El dinero que reciben mis beneficiarios paga impuestos?",
        answer: "En Colombia, por norma general, las indemnizaciones recibidas de un seguro de vida no constituyen renta gravable, por lo que tus beneficiarios no tendrían que pagar impuesto de renta sobre el dinero recibido. Es uno de los grandes beneficios de este instrumento de protección."
      },
      {
        question: "¿Puedo usar mi seguro de vida para pedir un préstamo?",
        answer: "Sí, si tienes un seguro de vida permanente con valor de rescate acumulado, puedes solicitar un préstamo a la aseguradora usando ese valor como garantía. Es una opción flexible para obtener liquidez en caso de necesidad sin tener que cancelar tu protección."
      }
    ],
    leadFormTitle: "Comienza tu Asesoría Gratuita Aquí",
    leadFormSubtitle: "Completa el formulario y un asesor especializado te contactará para ofrecerte la mejor solución adaptada a tus necesidades y presupuesto.",
    contactSectionTitle: "¿Listo para Proteger lo que Más Quieres?",
    contactSectionSubtitle: "No dejes tus dudas para después. Un asesor te espera para ofrecerte la mejor solución en seguros de vida.",
    contactSectionCtaText: "Solicitar Asesoría Gratuita",
    features: [
      {
        icon: "Landmark",
        title: "Asesoría Legal y Fiscal",
        description: "No solo entregamos un capital, te acompañamos. Nuestro equipo de expertos guía a tus beneficiarios en el proceso de sucesión y los impuestos asociados, asegurando que reciban el monto completo de la forma más rápida y eficiente, sin enredos legales."
      },
      {
        icon: "ClipboardList",
        title: "Gestión de Trámites",
        description: "En los momentos más duros, la burocracia es lo último en lo que tu familia debería pensar. Nos hacemos cargo de todo el papeleo, desde los trámites de sepelio hasta las últimas voluntades, para que puedan vivir su duelo en paz."
      },
      {
        icon: "DollarSign",
        title: "Adelanto para Gastos Urgentes",
        description: "La vida no se detiene, y los gastos tampoco. Liberamos un porcentaje del capital asegurado de forma casi inmediata para cubrir los gastos funerarios y otros costos urgentes, brindando un respiro financiero vital a tu familia cuando más lo necesita."
      },
      {
        icon: "HeartHandshake",
        title: "Apoyo Psicológico para Beneficiarios",
        description: "El verdadero legado es el bienestar emocional de los que dejas atrás. Por eso, incluimos sesiones de apoyo psicológico con profesionales para ayudar a tus seres queridos a transitar el duelo y encontrar consuelo en un momento tan delicado."
      }
    ]
  },
  salud: {
    id: "salud",
    title: "Seguro de Salud",
    shortDescription: "Accede a la mejor atención médica privada para ti y tu familia.",
    heroImage: "/images/hero-salud.jpg",
    heroImagePosition: 'center 70%',
    heroDescription: "Tu bienestar y el de tu familia es lo primero. Accede a la mejor atención médica privada, sin esperas y con el trato personalizado que mereces. Nosotros nos encargamos de que así sea.",
    heroCtaText: "Solicitar Asesoría Gratuita",
    explanationTitle: "¿En qué consiste el Seguro de Salud Privado?",
    explanationText: "Un seguro de salud privado te da acceso a servicios médicos y hospitalarios fuera del sistema público. Cubre consultas, pruebas diagnósticas, tratamientos, intervenciones quirúrgicas y hospitalización, según las condiciones de la póliza contratada. El objetivo es ofrecer una atención ágil, personalizada y de calidad.",
    whoIsItFor: [
      { persona: "Familias y particulares", description: "Que buscan una atención médica ágil y de calidad, sin listas de espera y con la libertad de elegir a sus especialistas." },
      { persona: "Profesionales autónomos", description: "Que no pueden permitirse bajas laborales y necesitan una respuesta médica inmediata para seguir siendo productivos." },
      { persona: "Empresas y directivos", description: "Que desean ofrecer un beneficio de alto valor a sus empleados, cuidando su salud y mejorando el clima laboral." },
      { persona: "Personas que valoran la prevención", description: "Que quieren acceso a chequeos completos y programas de bienestar para anticiparse a cualquier problema de salud." }
    ],
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
      },
      {
        icon: "Home",
        title: "Asistencia Médica Domiciliaria",
        description: "Recibe atención médica en la comodidad de tu hogar para consultas no urgentes, evitando desplazamientos innecesarios."
      },
      {
        icon: "Recycle",
        title: "Acceso a Terapias y Rehabilitación",
        description: "Cobertura para terapias físicas, respiratorias, ocupacionales y del lenguaje, fundamentales para una recuperación integral."
      }
    ],
    faq: [
      {
        question: "¿Qué diferencia hay entre un copago y un deducible?",
        answer: "El copago es un valor fijo que pagas al usar un servicio específico, como una consulta. El deducible es el monto total que debes cubrir de tu bolsillo en un período antes de que el seguro empiece a pagar. Un plan puede tener uno, ambos o ninguno. Te ayudamos a entender qué opción te conviene más."
      },
      {
        question: "¿Qué es una preexistencia y cómo afecta mi seguro?",
        answer: "Una preexistencia es una condición de salud que tenías antes de contratar la póliza. Es crucial declararla. Dependiendo de la condición y la aseguradora, puede que se apliquen exclusiones, límites de cobertura o un costo adicional en la prima. La transparencia es clave para garantizar tu cobertura."
      },
      {
        question: "¿Qué son los periodos de carencia?",
        answer: "Es el tiempo que debe pasar desde que contratas el seguro hasta que puedes usar ciertas coberturas (como cirugías programadas o maternidad). Las urgencias vitales suelen estar cubiertas desde el primer día. Es una medida estándar para proteger a la aseguradora."
      },
      {
        question: "¿Puedo incluir a mi familia en mi póliza?",
        answer: "¡Por supuesto! La mayoría de los planes permiten incluir a tu cónyuge e hijos como beneficiarios. Contratar un plan familiar suele ser más económico y práctico que tener pólizas individuales para cada miembro."
      },
      {
        question: "¿Qué diferencia hay entre un seguro de cuadro médico y uno de reembolso?",
        answer: "Un seguro de cuadro médico te da acceso a una red de clínicas y especialistas afiliados. Un seguro de reembolso te da la libertad de elegir cualquier médico en el mundo, pagas por el servicio y luego la aseguradora te devuelve un alto porcentaje del gasto (ej. 80-90%)."
      },
      {
        question: "¿Tengo cobertura si viajo fuera de Colombia?",
        answer: "Muchos planes de salud privados incluyen asistencia en viaje para emergencias médicas en el extranjero. Sin embargo, la cobertura, los límites y las condiciones varían. Si viajas con frecuencia, es vital revisar este punto y considerar una póliza con amplia cobertura internacional."
      },
      {
        question: "¿Cómo sé cuál es el plan de salud ideal para mí?",
        answer: "El plan ideal depende de tus necesidades, tu presupuesto y tu estilo de vida. ¿Usas servicios médicos con frecuencia? ¿Tienes familia? ¿Viajas mucho? Un asesor experto como nosotros analiza estos factores contigo para comparar opciones y ayudarte a tomar la mejor decisión, sin complicaciones."
      }
    ],
    leadFormTitle: "Encuentra tu Seguro de Salud Ideal",
    leadFormSubtitle: "Déjanos tus datos y te ayudaremos a comparar opciones para que elijas el seguro de salud que mejor se adapte a ti y a tu familia.",
    contactSectionTitle: "¿Listo para Proteger lo que Más Quieres?",
    contactSectionSubtitle: "No dejes tus dudas para después. Un asesor te espera para ofrecerte la mejor solución en seguros de salud.",
    contactSectionCtaText: "Solicitar Asesoría Gratuita",
    features: [
      {
        icon: "Users",
        title: "Segunda Opinión Médica Internacional",
        description: "Accede a la valoración de expertos de prestigio mundial para contrastar un diagnóstico o tratamiento complejo, sin salir de casa."
      },
      {
        icon: "MonitorSmartphone",
        title: "Telemedicina 24/7",
        description: "Resuelve tus dudas médicas al instante a través de videollamada o chat, evitando desplazamientos y esperas innecesarias."
      },
      {
        icon: "Smile",
        title: "Club de Bienestar",
        description: "Disfruta de descuentos exclusivos en gimnasios, spas, nutricionistas y otros servicios que complementan tu salud y bienestar."
      },
      {
        icon: "Activity",
        title: "Programas de Prevención Personalizados",
        description: "Te ayudamos a cuidarte con planes de prevención adaptados a tu edad y estilo de vida, para anticiparnos a cualquier problema de salud."
      }
    ]
  },
  auto: {
    id: "auto",
    title: "Seguro de Auto",
    shortDescription: "Cobertura completa para tu vehículo ante cualquier eventualidad.",
    heroImage: "/images/hero-auto.jpg",
    heroImagePosition: 'left',
    heroDescription: "Disfruta del camino con total tranquilidad. Te ofrecemos la protección completa que tu vehículo necesita para que conduzcas sin preocupaciones, respaldado por nuestra asesoría experta ante cualquier imprevisto.",
    heroCtaText: "Solicitar Asesoría Gratuita",
    explanationTitle: "¿Qué es el Seguro de Auto?",
    explanationText: "Es un contrato que te protege económicamente ante los riesgos asociados a la conducción y tenencia de un vehículo, como accidentes, robos o daños a terceros.",
    whoIsItFor: [
      { persona: "Conductores diarios", description: "Que necesitan su coche para ir a trabajar y dependen de él, requiriendo asistencia rápida y vehículo de sustitución." },
      { persona: "Familias viajeras", description: "Que usan el coche para sus escapadas y vacaciones, buscando la máxima protección para todos los ocupantes." },
      { persona: "Propietarios de coches nuevos", description: "Que quieren proteger su inversión con una cobertura a todo riesgo que responda ante cualquier eventualidad." },
      { persona: "Conductores ocasionales", description: "Que buscan una póliza económica pero fiable, que les cubra en sus desplazamientos puntuales." }
    ],
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
    faq: [
      {
        question: "¿El SOAT y el seguro todo riesgo son lo mismo?",
        answer: "No. El SOAT es un seguro obligatorio que cubre principalmente los gastos médicos de las personas involucradas en un accidente. El seguro todo riesgo es voluntario y mucho más completo: cubre los daños a tu propio vehículo, los daños que causes a otros carros o propiedad, y el robo de tu auto."
      },
      {
        question: "¿Es obligatorio tener un seguro todo riesgo?",
        answer: "No, legalmente no es obligatorio como el SOAT. Sin embargo, es altamente recomendable para proteger tu inversión. Un accidente puede costar millones, y el seguro te da la tranquilidad de estar cubierto ante esos gastos imprevistos."
      },
      {
        question: "¿Qué es el deducible y cómo funciona?",
        answer: "El deducible (a veces llamado franquicia) es el monto de dinero que tú asumes en caso de una reclamación por daños a tu vehículo. Por ejemplo, si el arreglo cuesta 5 millones y tu deducible es de 1 millón, tú pagas 1 millón y la aseguradora los 4 restantes. A mayor deducible, más económica es la prima del seguro."
      },
      {
        question: "¿Por qué cambia el precio de mi seguro cada año?",
        answer: "El precio de la póliza se basa en el riesgo. Factores como tu historial de conducción (si has tenido accidentes o no), tu edad, el modelo de tu carro e incluso las estadísticas de robo para ese modelo influyen en el costo. Un buen historial puede darte un mejor precio."
      },
      {
        question: "¿Si le pongo accesorios a mi carro, el seguro los cubre?",
        answer: "Generalmente, los accesorios que no vienen de fábrica (como rines especiales, pantallas o equipos de sonido) no están cubiertos automáticamente. Debes declararlos a la aseguradora al momento de contratar la póliza para que queden incluidos, lo cual puede tener un costo adicional."
      }
    ],
    leadFormTitle: "Obtén el Mejor Precio para tu Seguro de Auto",
    leadFormSubtitle: "Rápido y fácil: completa tus datos y recibe una comparativa personalizada para proteger tu vehículo al mejor precio.",
    features: [
      {
        icon: "Wrench",
        title: "Asistencia en Viaje Premium",
        description: "Cobertura desde el km 0, 24/7. Incluye grúa, reparación en el acto para averías leves y soluciones para problemas como pinchazos o falta de batería."
      },
      {
        icon: "Car",
        title: "Vehículo de Sustitución Garantizado",
        description: "No te quedes parado. Te proporcionamos un coche de sustitución no solo por accidente, sino también por avería, para que tu ritmo no pare."
      },
      {
        icon: "Gavel",
        title: "Gestión Integral de Multas",
        description: "Nos encargamos de recurrir tus multas de tráfico, ahorrándote tiempo y preocupaciones con nuestro equipo de expertos legales."
      },
      {
        icon: "ShieldCheck",
        title: "Revisión Anual de Seguridad",
        description: "Fomentamos la prevención con una revisión gratuita anual de los puntos clave de seguridad de tu vehículo en talleres concertados."
      }
    ],
    contactSectionTitle: "¿Listo para Proteger lo que Más Quieres?",
    contactSectionSubtitle: "No dejes tus dudas para después. Un asesor te espera para ofrecerte la mejor solución en seguros de auto.",
    contactSectionCtaText: "Solicitar Asesoría Gratuita"
  },
  hogar: {
    id: "hogar",
    title: "Seguro de Hogar",
    shortDescription: "Protege tu hogar y tus pertenencias contra daños y robos.",
    heroImage: "/images/hero-hogar.jpg",
    heroImagePosition: 'center',
    heroDescription: "Tu hogar es tu mayor tesoro. Asegura la tranquilidad de tu familia y protege tu inversión con una póliza que lo cubre todo, desde la estructura hasta tus bienes más preciados. Estamos aquí para que te sientas seguro en casa.",
    heroCtaText: "Solicitar Asesoría Gratuita",
    explanationTitle: "¿Por qué necesitas un Seguro de Hogar?",
    explanationText: "Un seguro de hogar protege tu vivienda y tus bienes ante imprevistos como incendios, robos, daños por agua, roturas o responsabilidad civil si causas daños a terceros.",
    whoIsItFor: [
      { persona: "Propietarios de vivienda habitual", description: "Que desean proteger su mayor patrimonio y la tranquilidad de su familia ante cualquier imprevisto." },
      { persona: "Propietarios de segundas residencias", description: "Que necesitan asegurar su casa de vacaciones o de fin de semana, incluso cuando no están allí." },
      { persona: "Propietarios que alquilan su vivienda", description: "Que buscan proteger el inmueble de daños y asegurar su inversión con coberturas específicas para arrendadores." },
      { persona: "Inquilinos", description: "Que quieren proteger sus pertenencias personales (muebles, tecnología, etc.) dentro de la vivienda que alquilan." }
    ],
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
      },
      {
        icon: "Wrench",
        title: "Asistencia Domiciliaria",
        description: "Servicios de plomería, cerrajería, electricidad y más, disponibles 24/7 para atender emergencias en tu hogar."
      },
      {
        icon: "Laptop",
        title: "Protección para Equipos Electrónicos",
        description: "Cobertura opcional para tus computadores, televisores y otros dispositivos contra daños accidentales o hurto."
      }
    ],
    faq: [
      {
        question: "¿Es obligatorio tener un seguro de hogar en Colombia?",
        answer: "No es obligatorio por ley, a menos que tengas una hipoteca. En ese caso, el banco te exigirá un seguro básico de incendio y terremoto. Sin embargo, es muy recomendable tener una póliza completa para proteger tu patrimonio ante cualquier eventualidad."
      },
      {
        question: "Si mi casa está hipotecada, ¿tengo que contratar el seguro con el banco?",
        answer: "No. Aunque el banco te lo ofrezca, no estás obligado a contratar el seguro con ellos. Tienes la libertad de elegir la aseguradora que prefieras. Comparar opciones te puede ayudar a encontrar una mejor cobertura a un mejor precio."
      },
      {
        question: "¿Qué significan 'continente' y 'contenido' en la póliza?",
        answer: "El 'continente' se refiere a la estructura de la vivienda (paredes, techos, pisos, ventanas) y sus instalaciones fijas (tuberías, sistema eléctrico). El 'contenido' son todos tus bienes personales dentro de la casa: muebles, electrodomésticos, ropa, etc."
      },
      {
        question: "Si vivo en un edificio, ¿el seguro de la copropiedad cubre mi apartamento?",
        answer: "No, el seguro de la copropiedad solo cubre las áreas comunes del edificio (fachada, escaleras, ascensores). Todo lo que ocurra de la puerta de tu apartamento hacia adentro, tanto a la estructura como a tus bienes, debe ser cubierto por tu seguro de hogar individual."
      },
      {
        question: "Como inquilino, ¿necesito un seguro de hogar?",
        answer: "Sí, es muy recomendable. El seguro del propietario cubre la estructura (el continente), pero no tus pertenencias (el contenido). Un seguro para inquilinos protege tus muebles, electrodomésticos y otros bienes en caso de robo o un siniestro como un incendio o daño por agua."
      }
    ],
    leadFormTitle: "Protege tu Hogar Hoy Mismo",
    leadFormSubtitle: "Descubre cómo podemos ayudarte a proteger tu hogar. Solicita tu presupuesto personalizado sin compromiso.",
    features: [
      {
        icon: "Home",
        title: "Servicio de Bricolaje en Casa",
        description: "Un 'manitas' profesional a tu disposición para pequeñas tareas de mantenimiento como colgar cuadros, montar muebles o instalar lámparas."
      },
      {
        icon: "Laptop",
        title: "Asistencia Tecnológica",
        description: "Soporte informático remoto para solucionar problemas con tu ordenador, tablet o smartphone, y proteger tus dispositivos de virus."
      },
      {
        icon: "Scale",
        title: "Protección Jurídica Familiar",
        description: "Asesoramiento legal telefónico sobre cualquier ámbito de tu vida privada y cobertura de los gastos de defensa jurídica."
      },
      {
        icon: "Bug",
        title: "Control de Plagas",
        description: "Si tienes un problema con insectos o roedores, enviamos a un profesional para que realice el tratamiento necesario sin coste adicional."
      }
    ],
    contactSectionTitle: "¿Listo para Proteger lo que Más Quieres?",
    contactSectionSubtitle: "No dejes tus dudas para después. Un asesor te espera para ofrecerte la mejor solución en seguros de hogar.",
    contactSectionCtaText: "Solicitar Asesoría Gratuita"
  },
  pymes: {
    id: "pymes",
    title: "Seguro para PYMES",
    shortDescription: "Soluciones personalizadas para proteger tu negocio.",
    heroImage: "/images/hero-pymes.jpg",
    heroImagePosition: 'center',
    heroDescription: "El futuro de tu empresa es nuestra prioridad. Te brindamos la seguridad que necesitas con soluciones a la medida de tu negocio, garantizando su continuidad y protegiendo tu esfuerzo para que sigas creciendo sin límites.",
    heroCtaText: "Solicitar Asesoría Gratuita",
    explanationTitle: "¿Qué cubre un Seguro para PYMES?",
    explanationText: "Los seguros para PYMES ofrecen un conjunto de coberturas para proteger el patrimonio de la empresa (instalaciones, maquinaria, existencias) y su responsabilidad ante reclamaciones de terceros.",
    whoIsItFor: [
      { persona: "Pequeños comercios y oficinas", description: "Que necesitan proteger su local, mercancías y mobiliario de los riesgos más comunes como robo, incendio o daños por agua." },
      { persona: "Talleres y pequeñas industrias", description: "Que requieren coberturas específicas para su maquinaria, la responsabilidad por sus trabajos y la protección de sus empleados." },
      { persona: "Emprendedores y startups", description: "Que buscan una póliza flexible que se adapte a su crecimiento y proteja su inversión inicial desde el primer día." },
      { persona: "Profesionales liberales", description: "Como abogados o consultores, que necesitan cubrir la responsabilidad civil profesional derivada de su actividad." }
    ],
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
      },
      {
        icon: "Server",
        title: "Protección de Equipos Electrónicos",
        description: "Asegura los equipos electrónicos fijos y móviles de tu empresa contra daños materiales, averías o hurto."
      },
      {
        icon: "Truck",
        title: "Transporte de Mercancías",
        description: "Cubre los daños o la pérdida de tus mercancías mientras son transportadas, ya sea en vehículos propios o de terceros."
      }
    ],
    faq: [
      {
        question: "¿Qué es un seguro multirriesgo para PYMES y por qué lo necesito?",
        answer: "Es una póliza integral que protege el corazón de tu negocio: tus bienes, tus ingresos y tu responsabilidad. Lo necesitas para garantizar que un imprevisto, como un incendio, un robo o una demanda, no signifique el fin de tu empresa."
      },
      {
        question: "¿Qué cubre exactamente un seguro para PYMES?",
        answer: "Cubre los daños a tus activos físicos (daños materiales), las reclamaciones de terceros por accidentes (responsabilidad civil), y la pérdida de ingresos si tienes que cerrar temporalmente por un siniestro (lucro cesante)."
      },
      {
        question: "Mi negocio es pequeño, ¿realmente necesito un seguro tan completo?",
        answer: "Sí, especialmente si es pequeño. Las PYMES son más vulnerables a las pérdidas porque tienen menos recursos para recuperarse. Un seguro multirriesgo es una inversión en tranquilidad y continuidad, más económica que contratar cada cobertura por separado."
      },
      {
        question: "¿El seguro cubre si mi negocio tiene que cerrar temporalmente por un daño?",
        answer: "Sí, a través de la cobertura de 'pérdida de beneficios' o 'lucro cesante'. Esta te ayuda a cubrir gastos fijos como arriendos y salarios mientras tu negocio se recupera, asegurando que el impacto financiero sea mínimo."
      },
      {
        question: "¿Qué tipo de responsabilidad civil necesito?",
        answer: "Necesitas la Responsabilidad Civil de Explotación, que cubre daños a terceros durante tu actividad (ej. un cliente se cae en tu local). También es clave la RC Patronal (accidentes de empleados) y la RC de Productos (daños causados por lo que vendes)."
      },
      {
        question: "¿Puedo adaptar el seguro a las necesidades específicas de mi empresa?",
        answer: "¡Claro que sí! Esa es una de las grandes ventajas. Las pólizas para PYMES son modulares y flexibles. Podemos analizar los riesgos específicos de tu sector y tamaño para construir una solución a la medida, pagando solo por lo que realmente necesitas."
      }
    ],
    leadFormTitle: "Obtén Asesoramiento Experto para tu PYME",
    leadFormSubtitle: "Analizamos a fondo los riesgos de tu negocio para ofrecerte una solución aseguradora completa y a medida. ¡Solicita tu estudio!",
    features: [
      {
        icon: "Landmark",
        title: "Asesoramiento Legal y Fiscal Experto",
        description: "Accede a un equipo de abogados y asesores para resolver dudas sobre contratos, impuestos, normativa laboral y cualquier aspecto legal de tu negocio."
      },
      {
        icon: "ShieldCheck",
        title: "Análisis y Prevención de Riesgos",
        description: "Un experto evaluará tus instalaciones y procesos para identificar vulnerabilidades y recomendarte medidas que minimicen el riesgo de siniestros."
      },
      {
        icon: "Wrench",
        title: "Asistencia Informática para Empresas",
        description: "Soporte técnico remoto para los equipos de tu negocio, garantizando la continuidad operativa y la seguridad de tu información."
      },
      {
        icon: "Award",
        title: "Subvenciones y Formación",
        description: "Te mantenemos informado sobre ayudas y subvenciones para tu sector y te damos acceso a programas de formación para ti y tus empleados."
      }
    ],
    contactSectionTitle: "¿Listo para Proteger lo que Más Quieres?",
    contactSectionSubtitle: "No dejes tus dudas para después. Un asesor te espera para ofrecerte la mejor solución en seguros de PYMES.",
    contactSectionCtaText: "Solicitar Asesoría Gratuita"
  },
  decesos: {
    id: "decesos",
    title: "Seguro de Decesos",
    shortDescription: "Cubre los gastos funerarios y gestiones necesarias.",
    heroImage: "/images/hero-decesos.jpg",
    heroImagePosition: 'center',
    heroDescription: "Un gesto de amor para los tuyos. Bríndales la tranquilidad de no tener que preocuparse por nada en los momentos más difíciles. Nos encargamos de todo, para que tu familia pueda despedirte en paz.",
    heroCtaText: "Solicitar Asesoría Gratuita",
    explanationTitle: "¿Qué es el Seguro de Decesos?",
    explanationText: "Es una póliza que cubre los gastos asociados al sepelio del asegurado, además de ofrecer asistencia a la familia en los trámites y gestiones necesarias tras el fallecimiento.",
    whoIsItFor: [
      { persona: "Personas previsoras", description: "Que no quieren dejar una carga económica y emocional a sus familiares en los momentos más difíciles." },
      { persona: "Familias", description: "Que buscan una solución integral para planificar el futuro y asegurar que los deseos de sus seres queridos sean respetados." },
      { persona: "Personas mayores", description: "Que desean tener todo organizado y pagado, garantizando su tranquilidad y la de sus hijos." },
      { persona: "Extranjeros residentes", description: "Que necesitan garantizar la repatriación a su país de origen en caso de fallecimiento, un proceso complejo y costoso." }
    ],
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
    faq: [
      {
        question: "¿Cuál es la diferencia entre un seguro de vida y un seguro de decesos?",
        answer: "Un seguro de vida entrega una indemnización económica a tus beneficiarios. Un seguro de decesos se enfoca en prestar un servicio: se encarga de organizar y cubrir todos los gastos y trámites del servicio funerario, liberando a tu familia de esa carga logística y económica."
      },
      {
        question: "¿Qué pasa si me mudo a otra ciudad o incluso a otro país?",
        answer: "No hay problema. La cobertura de un seguro de decesos es a nivel nacional. Si te mudas al extranjero, la mayoría de pólizas incluyen la garantía de repatriación para asegurar el traslado y el servicio en tu lugar de origen si así lo deseas."
      },
      {
        question: "¿Si me cambio de aseguradora, pierdo todo el dinero que he pagado?",
        answer: "No, no lo pierdes. A diferencia de otros seguros, el de decesos no es un producto de ahorro. Estás pagando por una garantía de servicio. Si decides cambiar, simplemente dejas de pagar a una compañía y empiezas a pagar en la nueva para mantener la cobertura activa."
      },
      {
        question: "¿Necesito un chequeo médico para contratarlo?",
        answer: "Generalmente no se requiere un chequeo médico exhaustivo. Sin embargo, es habitual que las aseguradoras pidan completar un sencillo cuestionario de salud, especialmente si se contrata a una edad avanzada, para evaluar el riesgo."
      },
      {
        question: "¿Qué ocurre si el costo del servicio es menor al capital asegurado?",
        answer: "Si después de cubrir todos los gastos del servicio funerario según lo pactado en la póliza queda un capital sobrante, este dinero no se lo queda la aseguradora. Se entrega a los herederos legales del asegurado."
      },
      {
        question: "¿El seguro cubre la compra del lote o la bóveda en el cementerio?",
        answer: "Generalmente, las pólizas exequiales cubren la prestación del servicio funerario, pero no la propiedad del lote o bóveda. Sin embargo, algunas pólizas ofrecen auxilios económicos o convenios para facilitar su adquisición. Es clave revisar las condiciones particulares de tu plan."
      },
      {
        question: "¿Puedo incluir a toda mi familia en una misma póliza?",
        answer: "Sí, una de las grandes ventajas es que puedes proteger a tu grupo familiar (cónyuge, hijos, padres) bajo una misma póliza. Esto simplifica la gestión y suele ser más económico que contratar seguros individuales para cada miembro."
      }
    ],
    leadFormTitle: "Planifica tu Tranquilidad y la de tu Familia",
    leadFormSubtitle: "Evita cargas innecesarias a tus seres queridos. Solicita información y te ayudaremos a encontrar el plan de decesos que mejor se ajuste a tus deseos y presupuesto.",
    features: [
      {
        icon: "FileSignature",
        title: "Gestión Digital del Legado",
        description: "Facilitamos la creación de tu testamento online y nos encargamos del borrado de tu huella digital para proteger tu privacidad póstuma."
      },
      {
        icon: "Scale",
        title: "Asistencia Jurídica Integral",
        description: "Un equipo de abogados te asiste con todos los trámites legales post-fallecimiento, como la obtención de certificados y la gestión de pensiones."
      },
      {
        icon: "HeartHandshake",
        title: "Apoyo Psicológico Familiar",
        description: "Ofrecemos sesiones de apoyo psicológico para tus seres queridos, ayudándoles a sobrellevar el duelo en un momento tan delicado."
      },
      {
        icon: "Plane",
        title: "Repatriación sin Fronteras",
        description: "Coordinamos y cubrimos el traslado del fallecido desde cualquier lugar del mundo hasta el lugar de sepelio que elija la familia."
      }
    ],
    contactSectionTitle: "¿Listo para Proteger lo que Más Quieres?",
    contactSectionSubtitle: "No dejes tus dudas para después. Un asesor te espera para ofrecerte la mejor solución en seguros de decesos.",
    contactSectionCtaText: "Solicitar Asesoría Gratuita"
  },
  mascotas: {
    id: "mascotas",
    title: "Seguro de Mascotas",
    shortDescription: "Protección completa para tu mascota.",
    heroImage: "/images/hero-mascotas.jpg",
    heroImagePosition: 'center',
    heroDescription: "El amor por tu mascota es incondicional, su salud no debería tener precio. Te damos la tranquilidad de saber que estará protegido ante cualquier imprevisto, con el respaldo de los mejores profesionales.",
    heroCtaText: "Solicitar Asesoría Gratuita",
    explanationTitle: "¿Qué es el Seguro de Mascotas?",
    explanationText: "Este seguro está diseñado para ofrecerte la máxima cobertura y tranquilidad para tu mascota, cubriendo gastos veterinarios, responsabilidad civil y más.",
    whoIsItFor: [
      { persona: "Dueños de perros y gatos", description: "Que consideran a su mascota un miembro más de la familia y quieren darle la mejor atención veterinaria sin preocuparse por el coste." },
      { persona: "Propietarios de cachorros y gatitos", description: "Que buscan proteger a sus nuevos compañeros desde el principio, cubriendo accidentes y enfermedades inesperadas." },
      { persona: "Dueños de animales de razas propensas a enfermedades", description: "Que quieren anticiparse a posibles problemas de salud genéticos con una cobertura completa." },
      { persona: "Personas con perros de razas potencialmente peligrosas (PPP)", description: "Que necesitan cumplir con la obligación legal de tener un seguro de Responsabilidad Civil." }
    ],
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
      },
      {
        icon: "HeartHandshake",
        title: "Gastos Funerarios",
        description: "Te ayudamos con los gastos de sepelio o cremación para despedir a tu mascota con el respeto y el cariño que se merece."
      },
      {
        icon: "Hotel",
        title: "Guardería por Hospitalización del Dueño",
        description: "Cubrimos los gastos de guardería para tu mascota si tienes que ser hospitalizado de imprevisto, garantizando su cuidado."
      }
    ],
    coveragesCtaText: "Ver Todas las Coberturas",
    faq: [
      { question: "¿Qué tipo de mascotas cubre el seguro?", answer: "Principalmente perros y gatos. Algunas aseguradoras pueden ofrecer coberturas para otras mascotas exóticas bajo condiciones específicas. Es importante consultarlo."
      },
      { question: "¿Hay límite de edad para asegurar a mi mascota?", answer: "Sí, la mayoría de las aseguradoras establecen una edad mínima (generalmente unos meses) y una máxima (alrededor de los 7-9 años) para la primera contratación. Una vez asegurada, la cobertura suele continuar."
      },
      { 
        question: "¿Cubre el seguro las enfermedades preexistentes de mi mascota?", 
        answer: "Generalmente, las enfermedades o condiciones que tu mascota ya padecía antes de contratar el seguro (preexistencias) no están cubiertas. Es fundamental ser transparente al declarar el estado de salud de tu mascota."
      }
    ],
    leadFormTitle: "Solicita Información para tu Seguro de Mascotas",
    leadFormSubtitle: "Uno de nuestros asesores te contactará para ofrecerte la mejor solución para tu fiel amigo.",
    contactSectionTitle: "¿Listo para Proteger lo que Más Quieres?",
    contactSectionSubtitle: "No dejes tus dudas para después. Un asesor te espera para ofrecerte la mejor solución en seguros de mascotas.",
    contactSectionCtaText: "Solicitar Asesoría Gratuita",
    features: [
      {
        icon: "Phone",
        title: "Veterinario Online 24/7",
        description: "Resuelve dudas sobre la salud de tu mascota al instante con nuestro servicio de consultas veterinarias por teléfono o videollamada, a cualquier hora."
      },
      {
        icon: "Home",
        title: "Cuidado Garantizado si te Ocurre Algo",
        description: "Si tienes que ser hospitalizado, nos encargamos de que tu mascota esté cuidada en una residencia de confianza hasta que te recuperes."
      },
      {
        icon: "Info",
        title: "Asesor Experto en Viajes",
        description: "Te ayudamos a planificar tus viajes con tu mascota, informándote sobre normativas, alojamientos pet-friendly y todo lo que necesitas."
      },
      {
        icon: "Percent",
        title: "Club de Ahorro para Mascotas",
        description: "Disfruta de una red de descuentos en alimentación, accesorios, peluquerías y otros servicios para que cuidar de tu mejor amigo cueste menos."
      }
    ]
  },
  motos: {
    id: "motos",
    title: "Seguro de Motos",
    shortDescription: "La mejor protección para ti y tu moto.",
    heroImage: "/images/hero-motos.jpg",
    heroImagePosition: 'center',
    heroDescription: "Siente la libertad en cada kilómetro. Te ofrecemos la protección que necesitas para que solo te preocupes por disfrutar de la carretera, con el respaldo de un equipo que entiende tu pasión por las dos ruedas.",
    heroCtaText: "Solicitar Asesoría Gratuita",
    explanationTitle: "¿Qué es el Seguro de Motos?",
    explanationText: "Un seguro de moto te protege frente a los riesgos asociados a la conducción, cubriendo desde la responsabilidad civil obligatoria hasta daños propios, robo o asistencia en viaje.",
    whoIsItFor: [
        { persona: "Motoristas urbanos", description: "Que usan la moto a diario para moverse por la ciudad y necesitan agilidad, asistencia rápida y cobertura de robo." },
        { persona: "Amantes de las rutas", description: "Que disfrutan de viajes largos y escapadas de fin de semana, buscando una asistencia en viaje completa y cobertura de equipamiento." },
        { persona: "Propietarios de motos de alta gama", description: "Que desean proteger su inversión con un seguro a todo riesgo que cubra cualquier daño propio." },
        { persona: "Conductores noveles", description: "Que buscan un seguro que les ofrezca seguridad y respaldo mientras ganan experiencia en la carretera." }
    ],
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
      },
      {
        icon: "Gavel",
        title: "Defensa Jurídica y Reclamación de Multas",
        description: "Te ofrecemos asistencia legal para tu defensa en procesos por accidente y te ayudamos a gestionar y recurrir multas de tránsito."
      }
    ],
    faq: [
      { 
        question: "¿Es obligatorio el seguro de moto?", 
        answer: "Sí, en España es obligatorio contar como mínimo con un seguro de Responsabilidad Civil para cualquier vehículo a motor, incluidas las motocicletas, para poder circular legalmente."
      },
      { 
        question: "¿Qué tipo de seguro de moto me conviene más: terceros, robo e incendio, o todo riesgo?", 
        answer: "Depende del valor y antigüedad de tu moto, el uso que le das y tu presupuesto. Terceros es lo básico. Robo e incendio añade protección importante. Todo riesgo es lo más completo, ideal para motos nuevas o de alto valor. Te asesoramos para elegir."
      },
      { 
        question: "¿El seguro de moto cubre el robo de accesorios como el casco o la chaqueta?", 
        answer: "Algunas pólizas, especialmente las de todo riesgo o con coberturas ampliadas, pueden incluir la cobertura de robo de equipamiento del motorista (casco, guantes, chaqueta) hasta un cierto límite y bajo condiciones específicas. Es importante verificarlo."
      }
    ],
    leadFormTitle: "Encuentra el Mejor Seguro para tu Moto",
    leadFormSubtitle: "Compara opciones y elige la cobertura perfecta para tus dos ruedas.",
    features: [
      {
        icon: "Wrench",
        title: "Asistencia Motera Especializada",
        description: "Servicio de asistencia en viaje diseñado por y para moteros, con soluciones rápidas para averías comunes y conocimiento de tus necesidades."
      },
      {
        icon: "Shirt",
        title: "Protección para tu Equipamiento",
        description: "Tu seguridad es clave. Cubrimos los daños o el robo de tu casco, guantes y chaqueta en caso de accidente."
      },
      {
        icon: "Gavel",
        title: "Defensa Jurídica del Motorista",
        description: "Te defendemos ante multas de tráfico y te ayudamos a gestionar la recuperación de puntos del carnet para que sigas en la carretera."
      },
      {
        icon: "Truck",
        title: "Grúa con Remolque Adaptado",
        description: "Garantizamos que tu moto será transportada de forma segura en una grúa con plataforma o anclajes específicos para vehículos de dos ruedas."
      }
    ],
    contactSectionTitle: "¿Listo para Proteger lo que Más Quieres?",
    contactSectionSubtitle: "No dejes tus dudas para después. Un asesor te espera para ofrecerte la mejor solución en seguros de motos.",
    contactSectionCtaText: "Solicitar Asesoría Gratuita"
  },
  arrendamiento: {
    id: "arrendamiento",
    title: "Seguro de Impago de Alquiler",
    shortDescription: "Garantiza el cobro de tus rentas y protege tu inversión.",
    heroImage: "/images/hero-arrendamiento.jpg",
    heroImagePosition: 'center',
    heroDescription: "Tu inversión inmobiliaria, protegida. Alquila con la certeza de que tus ingresos están garantizados y tu propiedad segura. Nos encargamos de los imprevistos para que tú solo te ocupes de la rentabilidad.",
    heroCtaText: "Solicitar Asesoría Gratuita",
    explanationTitle: "¿Qué es el Seguro de Impago de Alquiler?",
    explanationText: "Es una póliza diseñada para propietarios de inmuebles en alquiler. Garantiza el cobro de las rentas mensuales en caso de impago por parte del inquilino y puede cubrir los gastos de desahucio y daños en la vivienda.",
    whoIsItFor: [
        { persona: "Pequeños propietarios", description: "Que tienen una o dos viviendas en alquiler y dependen de esa renta, buscando la máxima seguridad." },
        { persona: "Inversores inmobiliarios", description: "Que gestionan una cartera de propiedades y necesitan optimizar la rentabilidad minimizando los riesgos de impago y daños." },
        { persona: "Propietarios que viven lejos", description: "Que no pueden gestionar de cerca su propiedad alquilada y necesitan un respaldo legal y administrativo completo." },
        { persona: "Propietarios primerizos", description: "Que alquilan por primera vez y quieren hacerlo con la tranquilidad de estar cubiertos por profesionales." }
    ],
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
      },
      {
        icon: "Receipt",
        title: "Pago de Servicios y Administración",
        description: "Cubrimos las facturas de servicios públicos (agua, luz, gas) y las cuotas de administración que tu inquilino deje sin pagar."
      },
      {
        icon: "Wrench",
        title: "Asistencia Domiciliaria para el Inmueble",
        description: "Coordinamos y cubrimos servicios de urgencia como plomería, cerrajería y electricidad para mantener tu propiedad en perfecto estado."
      }
    ],
    faq: [
      { 
        question: "¿Quién paga el seguro de impago de alquiler, el propietario o el inquilino?", 
        answer: "Generalmente, el seguro de impago de alquiler lo contrata y paga el propietario del inmueble, ya que es quien se beneficia directamente de la garantía de cobro de rentas y protección jurídica."
      },
      { 
        question: "¿Qué requisitos debe cumplir el inquilino para que el seguro sea aprobado?", 
        answer: "La aseguradora realizará un estudio de solvencia del inquilino. Normalmente se solicita documentación que acredite ingresos estables (contrato de trabajo, nóminas, declaración de la renta para autónomos) y que la renta no supere un porcentaje de sus ingresos (suele ser entre el 30% y 45%)."
      },
      { 
        question: "¿Cuánto tiempo tarda la aseguradora en pagar las rentas impagadas una vez se produce el impago?", 
        answer: "Una vez notificado el impago y presentada la documentación requerida, la aseguradora suele adelantar las rentas en un plazo breve, que puede variar entre 1 y 3 meses según la póliza, mientras se inician las gestiones de reclamación o desahucio."
      }
    ],
    leadFormTitle: "Asegura tus Ingresos por Alquiler",
    leadFormSubtitle: "Infórmate sobre cómo proteger tu inversión inmobiliaria.",
    features: [
      {
        icon: "Scale",
        title: "Defensa Jurídica Integral del Arrendador",
        description: "Cubrimos todos los gastos legales para defender tus derechos en caso de impago, obras no consentidas o cualquier conflicto con el inquilino."
      },
      {
        icon: "Bomb",
        title: "Protección Frente a Vandalismo",
        description: "Reparamos los daños malintencionados que el inquilino pueda causar en tu vivienda, protegiendo el valor de tu propiedad."
      },
      {
        icon: "SprayCan",
        title: "Compensación por Impago de Suministros",
        description: "Si el inquilino deja de pagar las facturas de luz, agua o gas, nos hacemos cargo de la deuda pendiente hasta el límite pactado."
      },
      {
        icon: "Tool",
        title: "Selección Rigurosa de Inquilinos",
        description: "Realizamos un estudio de viabilidad financiera de los candidatos para asegurar que eliges a un inquilino solvente y fiable."
      }
    ],
    contactSectionTitle: "¿Listo para Proteger lo que Más Quieres?",
    contactSectionSubtitle: "No dejes tus dudas para después. Un asesor te espera para ofrecerte la mejor solución en seguros de impago de alquiler.",
    contactSectionCtaText: "Solicitar Asesoría Gratuita"
  },
  viaje: {
    id: "viaje",
    title: "Seguro de Viaje",
    shortDescription: "Viaja con total tranquilidad y cobertura mundial.",
    heroImage: "/images/hero-viaje.jpg",
    heroImagePosition: 'center',
    heroDescription: "Tu próxima aventura te espera, viaja sin límites ni preocupaciones. Te protegemos ante cualquier imprevisto en cualquier rincón del mundo, para que tu única misión sea disfrutar y crear recuerdos inolvidables.",
    heroCtaText: "Solicitar Asesoría Gratuita",
    explanationTitle: "¿Por qué necesitas un Seguro de Viaje?",
    explanationText: "Un seguro de viaje te cubre ante eventualidades como gastos médicos por enfermedad o accidente, cancelación del viaje, pérdida de equipaje, repatriación y responsabilidad civil en el extranjero.",
    whoIsItFor: [
        { persona: "Turistas y aventureros", description: "Que exploran nuevos destinos y quieren estar cubiertos ante cualquier imprevisto médico, de equipaje o cancelación." },
        { persona: "Estudiantes de intercambio", description: "Que van a pasar una temporada en el extranjero y necesitan una cobertura médica completa y asistencia legal." },
        { persona: "Viajeros de negocios", description: "Que necesitan protección para sus viajes frecuentes, cobertura de cancelación y asistencia para sus equipos de trabajo." },
        { persona: "Familias", description: "Que viajan con niños y buscan la tranquilidad de tener asistencia médica pediátrica y cobertura para todos los miembros." }
    ],
    coveragesTitle: "Coberturas Imprescindibles en tu Viaje",
    coverages: [
      { icon: "PlaneTakeoff", title: "Asistencia Médica y Sanitaria", description: "Cobertura de gastos médicos, hospitalización y medicamentos en el extranjero." },
      { icon: "Luggage", title: "Pérdida, Robo o Daño de Equipaje", description: "Indemnización por problemas con tus pertenencias." },
      { icon: "FileX2", title: "Cancelación o Interrupción del Viaje", description: "Reembolso de gastos si no puedes viajar o tienes que regresar antes." },
      { icon: "Globe", title: "Repatriación Sanitaria y Fallecimiento", description: "Traslado a tu país de origen en caso de necesidad." },
      { icon: "ShieldCheck", title: "Responsabilidad Civil Privada", description: "Cubre los daños que puedas causar a terceros durante tu viaje." },
      { icon: "Clock", title: "Retraso en la Salida y Pérdida de Conexiones", description: "Compensación por gastos de manutención y hotel si tu transporte se retrasa, y asistencia para reorganizar tu viaje si pierdes una conexión." }
    ],
    faq: [
      { 
        question: "¿Cuándo debo contratar el seguro de viaje?", 
        answer: "Lo ideal es contratarlo tan pronto como reserves tu viaje (vuelos, alojamiento). Así estarás cubierto ante imprevistos que puedan llevar a la cancelación del viaje antes de la salida."
      },
      { 
        question: "¿El seguro de viaje cubre la práctica de deportes de aventura?", 
        answer: "Depende de la póliza. Muchos seguros básicos no cubren deportes considerados de riesgo. Si vas a practicar actividades como esquí, buceo, senderismo de alta montaña, etc., asegúrate de que tu póliza incluya una cobertura específica para deportes de aventura."
      },
      { 
        question: "¿Qué hago si necesito asistencia médica urgente en el extranjero?", 
        answer: "Contacta inmediatamente con el teléfono de asistencia 24 horas que te proporciona la aseguradora. Ellos te indicarán los pasos a seguir, te dirigirán a centros médicos concertados si es posible, y gestionarán la cobertura de los gastos según tu póliza."
      }
    ],
    leadFormTitle: "Viaja Seguro y sin Preocupaciones",
    leadFormSubtitle: "Obtén tu presupuesto de seguro de viaje personalizado en minutos.",
    features: [
      {
        icon: "HeartPulse",
        title: "Asistencia Médica Mundial 24/7",
        description: "Accede a una red médica global y a un equipo de asistencia que habla tu idioma para gestionar cualquier emergencia sanitaria, estés donde estés."
      },
      {
        icon: "FileX",
        title: "Flexibilidad Total para Cancelaciones",
        description: "Recupera los gastos de tu viaje si tienes que cancelarlo por una de las múltiples causas cubiertas, incluyendo imprevistos de última hora."
      },
      {
        icon: "Briefcase",
        title: "Protección Completa para tu Equipaje",
        description: "Te indemnizamos por la pérdida, robo o daño de tu equipaje y te ayudamos con los gastos de primera necesidad si se retrasa su entrega."
      },
      {
        icon: "CreditCard",
        title: "Adelanto de Fondos y Ayuda Urgente",
        description: "Si te roban la cartera o tienes una emergencia, te adelantamos dinero y te ayudamos con la gestión de documentos para que puedas continuar tu viaje."
      }
    ],
    contactSectionTitle: "¿Listo para Proteger lo que Más Quieres?",
    contactSectionSubtitle: "No dejes tus dudas para después. Un asesor te espera para ofrecerte la mejor solución en seguros de viaje.",
    contactSectionCtaText: "Solicitar Asesoría Gratuita"
  }
};
