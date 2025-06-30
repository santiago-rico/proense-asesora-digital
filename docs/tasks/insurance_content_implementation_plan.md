# IMPLEMENTATION PLAN: Insurance Content Optimization
## Proense Seguros - Colombian Market Alignment

---

## PHASE 1: CRITICAL FIXES (Priority: HIGH)

### 1.1 Geographic Reference Corrections

**File:** `src/data/insuranceProductsData.ts`

**SEGURO DE MOTOS - FAQ Section:**

**REPLACE:**
```typescript
{
  question: "¿Es obligatorio el seguro de moto?", 
  answer: "Sí, en España es obligatorio contar como mínimo con un seguro de Responsabilidad Civil para cualquier vehículo a motor, incluidas las motocicletas, para poder circular legalmente."
}
```

**WITH:**
```typescript
{
  question: "¿Es obligatorio el seguro de moto en Colombia?", 
  answer: "Sí, en Colombia es obligatorio contar como mínimo con SOAT para cualquier motocicleta que circule por el territorio nacional. Adicionalmente, se recomienda tener un seguro voluntario que cubra daños propios, robo y responsabilidad civil extracontractual para mayor protección."
}
```

### 1.2 Insurance Terminology Corrections

**SEGURO DE AUTO - Coverage Section:**

**REPLACE:**
```typescript
{
  icon: "CarCrash",
  title: "Responsabilidad Civil Obligatoria y Voluntaria",
  description: "Cubre los daños materiales y personales que puedas causar a terceros en un accidente. Es la cobertura esencial y legalmente obligatoria."
}
```

**WITH:**
```typescript
{
  icon: "CarCrash",
  title: "Responsabilidad Civil Extracontractual (RCE)",
  description: "Cubre los daños materiales que puedas causar a terceros en un accidente. Es la cobertura esencial que complementa el SOAT obligatorio, protegiendo tu patrimonio ante reclamaciones por daños a otros vehículos o propiedades."
}
```

**SEGURO DE AUTO - Add Deducible Clarification:**

**REPLACE:**
```typescript
{
  icon: "ShieldCheck",
  title: "Daños Propios (Todo Riesgo)",
  description: "Reparamos los daños de tu propio vehículo, incluso si eres el culpable del siniestro. Incluye colisión, vandalismo y más."
}
```

**WITH:**
```typescript
{
  icon: "ShieldCheck",
  title: "Daños Propios (Todo Riesgo)",
  description: "Reparamos los daños de tu propio vehículo, incluso si eres el culpable del siniestro. Incluye colisión, vandalismo y más. Aplica deducible según tu plan contratado."
}
```

**SEGURO DE SALUD - Title and Explanation:**

**REPLACE:**
```typescript
explanationTitle: "¿En qué consiste el Seguro de Salud Privado?",
explanationText: "Un seguro de salud privado te da acceso a servicios médicos y hospitalarios fuera del sistema público..."
```

**WITH:**
```typescript
explanationTitle: "¿Qué es una Póliza de Salud?",
explanationText: "Una póliza de salud es un seguro médico que te brinda la libertad de elegir cualquier médico o especialista, dentro o fuera de la red médica, con reembolsos de hasta el 100% de los gastos. A diferencia de la medicina prepagada, no estás limitado a un directorio específico y puedes recibir atención médica de calidad en cualquier lugar, complementando tu EPS obligatoria."
```

---

## PHASE 2: PERSONA CONSOLIDATION (Priority: MEDIUM)

### 2.1 SEGURO DE VIDA

**REPLACE:**
```typescript
whoIsItFor: [
  { persona: "Padres y madres de familia", description: "Asegura la educación y el bienestar de tus hijos, garantizando que tus metas para ellos se cumplan sin importar lo que pase." },
  { persona: "Jóvenes profesionales con deudas", description: "Protege tu patrimonio y evita dejar cargas financieras a tus seres queridos, como créditos hipotecarios o estudiantiles." },
  { persona: "Socios y dueños de negocios", description: "Garantiza la continuidad de tu empresa y protege a tus socios o familiares ante tu ausencia inesperada." },
  { persona: "Personas previsoras", description: "Crea un legado financiero sólido y planifica tu futuro con una herramienta que te brinda tranquilidad y respaldo." }
]
```

**WITH:**
```typescript
whoIsItFor: [
  { persona: "Cabezas de familia", description: "Asegura la educación y el bienestar de tus hijos, garantizando que tus metas para ellos se cumplan sin importar lo que pase. Protege tu patrimonio familiar y evita dejar cargas financieras a tus seres queridos." },
  { persona: "Jóvenes profesionales y emprendedores", description: "Protege tu patrimonio y evita dejar cargas financieras como créditos hipotecarios o estudiantiles. Ideal para socios y dueños de negocios que necesitan garantizar la continuidad empresarial." },
  { persona: "Personas que planifican su futuro", description: "Crea un legado financiero sólido y planifica tu futuro con una herramienta que te brinda tranquilidad y respaldo para ti y tu familia, construyendo un patrimonio duradero." }
]
```

### 2.2 SEGURO DE SALUD

**REPLACE:**
```typescript
whoIsItFor: [
  { persona: "Familias y particulares", description: "Que buscan una atención médica ágil y de calidad, sin listas de espera y con la libertad de elegir a sus especialistas." },
  { persona: "Profesionales autónomos", description: "Que no pueden permitirse bajas laborales y necesitan una respuesta médica inmediata para seguir siendo productivos." },
  { persona: "Empresas y directivos", description: "Que desean ofrecer un beneficio de alto valor a sus empleados, cuidando su salud y mejorando el clima laboral." },
  { persona: "Personas que valoran la prevención", description: "Que quieren acceso a chequeos completos y programas de bienestar para anticiparse a cualquier problema de salud." }
]
```

**WITH:**
```typescript
whoIsItFor: [
  { persona: "Familias jóvenes", description: "Que buscan atención médica ágil y de calidad para todos los miembros, sin listas de espera y con la libertad de elegir especialistas para el cuidado integral de la familia." },
  { persona: "Profesionales independientes", description: "Que no pueden permitirse interrupciones en su actividad laboral y necesitan una respuesta médica inmediata, con acceso a la mejor red de especialistas del país." },
  { persona: "Empleados con EPS", description: "Que desean complementar su plan obligatorio con cobertura superior, acceso a clínicas privadas y servicios adicionales para un cuidado de salud premium." }
]
```

### 2.3 SEGURO DE AUTO

**REPLACE:**
```typescript
whoIsItFor: [
  { persona: "Conductores diarios", description: "Que necesitan su coche para ir a trabajar y dependen de él, requiriendo asistencia rápida y vehículo de sustitución." },
  { persona: "Familias viajeras", description: "Que usan el coche para sus escapadas y vacaciones, buscando la máxima protección para todos los ocupantes." },
  { persona: "Propietarios de coches nuevos", description: "Que quieren proteger su inversión con una cobertura a todo riesgo que responda ante cualquier eventualidad." },
  { persona: "Conductores ocasionales", description: "Que buscan una póliza económica pero fiable, que les cubra en sus desplazamientos puntuales." }
]
```

**WITH:**
```typescript
whoIsItFor: [
  { persona: "Conductores urbanos diarios", description: "Que necesitan su coche para trabajar y desplazarse en la ciudad, requiriendo asistencia rápida y respaldo ante cualquier eventualidad en el tráfico colombiano." },
  { persona: "Propietarios de vehículos nuevos o de valor", description: "Que quieren proteger su inversión con una cobertura completa que responda ante cualquier eventualidad, desde accidentes hasta robo o vandalismo." },
  { persona: "Familias que dependen de su vehículo", description: "Que usan el coche para todas sus actividades y necesitan la máxima protección, incluyendo vehículo de reemplazo y asistencia integral." }
]
```

### 2.4 SEGURO DE HOGAR

**REPLACE:**
```typescript
whoIsItFor: [
  { persona: "Propietarios de vivienda habitual", description: "Que desean proteger su mayor patrimonio y la tranquilidad de su familia ante cualquier imprevisto." },
  { persona: "Propietarios de segundas residencias", description: "Que necesitan asegurar su casa de vacaciones o de fin de semana, incluso cuando no están allí." },
  { persona: "Propietarios que alquilan su vivienda", description: "Que buscan proteger el inmueble de daños y asegurar su inversión con coberturas específicas para arrendadores." },
  { persona: "Inquilinos", description: "Que quieren proteger sus pertenencias personales (muebles, tecnología, etc.) dentro de la vivienda que alquilan." }
]
```

**WITH:**
```typescript
whoIsItFor: [
  { persona: "Propietarios de vivienda", description: "Que desean proteger su mayor patrimonio familiar ante eventos como sismos, inundaciones, robos o incendios, garantizando la tranquilidad y seguridad de su hogar." },
  { persona: "Arrendatarios (inquilinos)", description: "Que quieren proteger sus pertenencias personales (muebles, electrodomésticos, tecnología) dentro de la vivienda que alquilan, asegurando su patrimonio personal." },
  { persona: "Propietarios de inmuebles en alquiler", description: "Que buscan proteger su inversión inmobiliaria con coberturas específicas para arrendadores, incluyendo daños causados por inquilinos y pérdida de rentas." }
]
```

### 2.5 SEGURO PARA PYMES

**REPLACE:**
```typescript
whoIsItFor: [
  { persona: "Pequeños comercios y oficinas", description: "Que necesitan proteger su local, mercancías y mobiliario de los riesgos más comunes como robo, incendio o daños por agua." },
  { persona: "Talleres y pequeñas industrias", description: "Que requieren coberturas específicas para su maquinaria, la responsabilidad por sus trabajos y la protección de sus empleados." },
  { persona: "Emprendedores y startups", description: "Que buscan una póliza flexible que se adapte a su crecimiento y proteja su inversión inicial desde el primer día." },
  { persona: "Profesionales liberales", description: "Como abogados o consultores, que necesitan cubrir la responsabilidad civil profesional derivada de su actividad." }
]
```

**WITH:**
```typescript
whoIsItFor: [
  { persona: "Pequeños comercios y oficinas", description: "Que necesitan proteger su local, mercancías y mobiliario de los riesgos más comunes como robo, incendio o daños por agua, garantizando la continuidad del negocio." },
  { persona: "Emprendedores y startups", description: "Que buscan una póliza flexible que se adapte a su crecimiento y proteja su inversión inicial desde el primer día, con coberturas modulares que evolucionen con el negocio." },
  { persona: "Profesionales independientes", description: "Como abogados, consultores o contadores, que necesitan cubrir la responsabilidad civil profesional derivada de su actividad y proteger sus equipos de trabajo." }
]
```

### 2.6 SEGURO DE MASCOTAS

**REPLACE:**
```typescript
whoIsItFor: [
  { persona: "Dueños de perros y gatos", description: "Que consideran a su mascota un miembro más de la familia y quieren darle la mejor atención veterinaria sin preocuparse por el coste." },
  { persona: "Propietarios de cachorros y gatitos", description: "Que buscan proteger a sus nuevos compañeros desde el principio, cubriendo accidentes y enfermedades inesperadas." },
  { persona: "Dueños de animales de razas propensas a enfermedades", description: "Que quieren anticiparse a posibles problemas de salud genéticos con una cobertura completa." },
  { persona: "Personas con perros de razas potencialmente peligrosas (PPP)", description: "Que necesitan cumplir con la obligación legal de tener un seguro de Responsabilidad Civil." }
]
```

**WITH:**
```typescript
whoIsItFor: [
  { persona: "Familias con mascotas", description: "Que consideran a su perro o gato un miembro más de la familia y quieren darle la mejor atención veterinaria sin preocuparse por los costos médicos inesperados." },
  { persona: "Propietarios de mascotas jóvenes", description: "Que buscan proteger a sus cachorros y gatitos desde el principio, cubriendo accidentes, enfermedades y estableciendo una base sólida para su cuidado futuro." },
  { persona: "Dueños conscientes de la responsabilidad", description: "Que entienden la importancia de tener cobertura de responsabilidad civil para protegerse ante posibles daños que su mascota pueda causar a terceros o propiedades." }
]
```

### 2.7 SEGURO DE VIAJE

**REPLACE:**
```typescript
whoIsItFor: [
  { persona: "Turistas y aventureros", description: "Que exploran nuevos destinos y quieren estar cubiertos ante cualquier imprevisto médico, de equipaje o cancelación." },
  { persona: "Estudiantes de intercambio", description: "Que van a pasar una temporada en el extranjero y necesitan una cobertura médica completa y asistencia legal." },
  { persona: "Viajeros de negocios", description: "Que necesitan protección para sus viajes frecuentes, cobertura de cancelación y asistencia para sus equipos de trabajo." },
  { persona: "Familias", description: "Que viajan con niños y buscan la tranquilidad de tener asistencia médica pediátrica y cobertura para todos los miembros." }
]
```

**WITH:**
```typescript
whoIsItFor: [
  { persona: "Viajeros frecuentes", description: "Turistas, aventureros y viajeros de negocios que exploran nuevos destinos y necesitan estar cubiertos ante cualquier imprevisto médico, de equipaje o cancelación en sus múltiples viajes." },
  { persona: "Familias que viajan", description: "Que buscan la tranquilidad de tener asistencia médica completa para todos los miembros, especialmente cuando viajan con niños, garantizando cobertura pediátrica especializada." },
  { persona: "Estudiantes y trabajadores en el exterior", description: "Que van a pasar temporadas prolongadas fuera de Colombia y necesitan una cobertura médica integral, asistencia legal y protección durante toda su estancia." }
]
```

---

## PHASE 2.5: COVERAGE CORRECTIONS BASED ON SURA ANALYSIS (Priority: HIGH)

### Coverage Analysis Results
After analyzing SURA's actual insurance offerings, several coverage misalignments were identified:



### 2.5.2 SEGURO DE AUTO - Coverage Corrections

**ISSUE:** Current coverage lacks specific Colombian monetary limits and terminology.

**REPLACE:**
```typescript
{
  icon: "CarCrash",
  title: "Responsabilidad Civil Extracontractual (RCE)",
  description: "Cubre los daños materiales que puedas causar a terceros en un accidente. Es la cobertura esencial que complementa el SOAT obligatorio, protegiendo tu patrimonio ante reclamaciones por daños a otros vehículos o propiedades."
}
```

**WITH:**
```typescript
{
  icon: "CarCrash",
  title: "Responsabilidad Civil Extracontractual (RCE)",
  description: "Cubre los daños materiales que puedas causar a terceros en un accidente. Protege tu patrimonio ante reclamaciones por daños a otros vehículos, propiedades y lesiones no cubiertas por SOAT."
}
```

### 2.5.4 SEGURO DE MASCOTAS - Coverage Corrections

**ISSUE:** Our coverages are too generic and don't match Colombian market offerings.

**REPLACE:**
```typescript
{
  icon: "Stethoscope",
  title: "Asistencia Veterinaria por Accidente y Enfermedad", 
  description: "Cubre consultas, pruebas diagnósticas, cirugías, hospitalización y medicamentos en caso de accidente o enfermedad."
}
```

**WITH:**
```typescript
{
  icon: "Stethoscope",
  title: "Gastos Veterinarios por Enfermedad y Accidente",
  description: "Cubre consultas, tratamientos, hospitalización y medicamentos necesarios. Incluye servicio de medicamentos a domicilio y orientación nutricional veterinaria."
}
```


---

## PHASE 3: FAQ ENHANCEMENTS (Priority: MEDIUM)
### 3.2 SEGURO DE SALUD - Add Colombian Market FAQs

**ADD TO FAQ ARRAY:**
```typescript
{
  question: "¿Puedo tener una póliza de salud y EPS al mismo tiempo?",
  answer: "Sí, en Colombia es obligatorio estar afiliado a una EPS y la póliza de salud es un seguro adicional y voluntario. La póliza de salud complementa y mejora significativamente los servicios de tu EPS, ofreciéndote libertad total para elegir médicos y recibir reembolsos."
},
{
  question: "¿Cuál es la diferencia entre medicina prepagada y póliza de salud?",
  answer: "La medicina prepagada te limita a una red cerrada de médicos y no ofrece reembolsos - solo puedes usar los prestadores de su directorio. Una póliza de salud te da libertad total: puedes ir a cualquier médico (dentro o fuera de la red) y recibir reembolsos de hasta el 100% de los gastos. Con la póliza de salud tienes mayor flexibilidad y cobertura."
},

### 3.3 SEGURO DE AUTO - Add RCE Clarification

**ADD TO FAQ ARRAY:**
```typescript
{
  question: "¿Qué es RCE y en qué se diferencia del SOAT?",
  answer: "La Responsabilidad Civil Extracontractual (RCE) cubre daños materiales a terceros (otros vehículos, propiedades). El SOAT es obligatorio y solo cubre gastos médicos de personas. La RCE es voluntaria pero esencial para protegerte de costosos daños materiales e inmateriales."
}
```

### 3.4 SEGURO DE HOGAR - Add Colombian Context

**ADD TO FAQ ARRAY:**
```typescript
{
  question: "¿El seguro de hogar cubre daños por sismos en Colombia?",
  answer: "Sí, la mayoría de pólizas en Colombia incluyen cobertura por sismos y terremotos como parte de la protección básica, dado que es un riesgo natural común en nuestro país. Es importante verificar los límites y deducibles específicos de tu póliza."
}
```

---

## PHASE 4: SEO OPTIMIZATION (Priority: LOW)

### 4.1 Add Colombian Keywords to Descriptions

**Pattern to Follow:**
- Include "Colombia" in hero descriptions
**Example for SEGURO DE VIDA:**

**REPLACE:**
```typescript
heroDescription: "Garantiza el futuro financiero de tu familia y vive con la tranquilidad de saber que están protegidos. Nosotros te ayudamos a hacerlo simple."
```

**WITH:**
```typescript
heroDescription: "Garantiza el futuro financiero de tu familia en Colombia y vive con la tranquilidad de saber que están protegidos. Nuestros asesores certificados te ayudan a hacerlo simple, con productos respaldados por las mejores aseguradoras del país."
```
---


### Quality Assurance
- [ ] Review all content for Colombian Spanish consistency
- [ ] Verify no remaining Spanish geographic references
- [ ] Test lead form submissions with new content

---