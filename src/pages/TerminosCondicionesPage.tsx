import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';

interface TerminosCondicionesPageProps {
  handleOpenLeadDialog: () => void;
}

const TerminosCondicionesPage: React.FC<TerminosCondicionesPageProps> = ({ handleOpenLeadDialog }) => {
  return (
    <Layout handleOpenLeadDialog={handleOpenLeadDialog}>
      {/* Hero Section */}
      <section className="bg-primary text-white py-12 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold">Términos y Condiciones</h1>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl prose lg:prose-xl">
          <p className="text-sm text-gray-600 mb-6">Fecha de Última Actualización: 16 de Junio de 2025</p>

          <h2 className="text-2xl font-semibold mb-3">1. TÉRMINOS Y CONDICIONES GENERALES Y ACEPTACIÓN</h2>
          <p className="mb-4">
            El presente documento regula el acceso y uso del sitio web www.proense.com.co (el “Sitio Web”), titularidad de PROENSE AGENCIA DE SEGUROS LTDA (en adelante “PROENSE”). La utilización del Sitio Web le atribuye la condición de “Usuario” e implica su aceptación plena, consciente y sin reservas de todas las disposiciones aquí contenidas. Si el Usuario no está de acuerdo con estos Términos y Condiciones, deberá abstenerse de acceder y/o utilizar este Sitio Web.
          </p>

          <h2 className="text-2xl font-semibold mb-3">2. IDENTIFICACIÓN DEL TITULAR DEL SITIO WEB</h2>
          <ul className="list-none mb-4 pl-0">
            <li><strong>Razón Social:</strong> PROENSE AGENCIA DE SEGUROS LTDA</li>
            <li><strong>NIT:</strong> 901.915.787-3</li>
            <li><strong>Domicilio Principal:</strong> Pereira, Risaralda, República de Colombia.</li>
          </ul>

          <h2 className="text-2xl font-semibold mb-3">3. OBJETO DEL SITIO Y NATURALEZA DEL SERVICIO</h2>
          <p className="mb-4">
            El Sitio Web es una plataforma digital cuyo objeto es presentar el portafolio de servicios de intermediación de seguros de PROENSE, ofrecer información de valor y facilitar un canal de contacto para que los Usuarios puedan solicitar asesoría. El Usuario reconoce que PROENSE actúa como intermediario de seguros y no como una compañía aseguradora.
          </p>

          <h2 className="text-2xl font-semibold mb-3">4. ALTERACIONES AL SITIO WEB Y A LOS SERVICIOS</h2>
          <p className="mb-4">
            PROENSE se reserva el derecho, de forma unilateral y en cualquier momento, de modificar, suspender, interrumpir o descontinuar el Sitio Web, ya sea de forma temporal o permanente. Esto incluye la alteración, adición o eliminación de cualquier contenido, herramienta o servicio ofrecido, sin necesidad de previo aviso al Usuario y sin que ello genere derecho a reclamo o indemnización alguna a su favor.
          </p>

          <h2 className="text-2xl font-semibold mb-3">5. COTIZACIONES</h2>
          <p className="mb-4">
            La solicitud de cotizaciones a través del Sitio Web constituye una mera solicitud de información por parte del Usuario y no representa una oferta comercial vinculante por parte de PROENSE ni de las compañías aseguradoras. Las condiciones, tarifas, coberturas y deducibles son de carácter informativo y preliminar, y están sujetos a la evaluación del riesgo y a la confirmación final por parte de la entidad aseguradora. El contrato de seguro se entiende perfeccionado únicamente con la emisión formal de la póliza por parte de la compañía de seguros y el pago de la prima correspondiente.
          </p>

          <h2 className="text-2xl font-semibold mb-3">6. CONTENIDO Y USO ADECUADO</h2>
          <p className="mb-4">
            El Usuario se compromete a hacer un uso diligente y lícito del contenido informativo provisto en el Sitio Web. Este contenido es de carácter orientativo y no debe ser interpretado como asesoría legal, financiera o de cualquier otra índole que sustituya la consulta profesional personalizada. PROENSE no se responsabiliza por las decisiones que el Usuario tome basándose únicamente en la información generalista del Sitio Web.
          </p>

          <h2 className="text-2xl font-semibold mb-3">7. ENLACES A TERCERAS PARTES</h2>
          <p className="mb-4">
            El Sitio Web puede contener hipervínculos o enlaces a sitios web de terceros (ej: compañías de seguros, entidades regulatorias, etc.). Estos enlaces se proporcionan únicamente para conveniencia del Usuario. PROENSE no ejerce control sobre dichos sitios, no respalda su contenido y, por lo tanto, no asume ninguna responsabilidad por la información, las prácticas de privacidad, la seguridad o la funcionalidad de los mismos. El acceso a cualquier sitio de terceros enlazado desde este Sitio Web se realiza bajo el exclusivo riesgo del Usuario.
          </p>

          <h2 className="text-2xl font-semibold mb-3">8. PROPIEDAD INTELECTUAL</h2>
          <p className="mb-4">
            La totalidad de los contenidos del Sitio Web, incluyendo, a título enunciativo, textos, gráficos, logotipos, código fuente, imágenes, videos y marcas comerciales, son propiedad exclusiva de PROENSE o de terceros que han autorizado su uso. Dichos contenidos están protegidos por la legislación colombiana y supranacional en materia de propiedad intelectual e industrial. Queda estrictamente prohibida su reproducción, copia, distribución o cualquier otra forma de explotación sin la autorización previa, expresa y por escrito de PROENSE.
          </p>

          <h2 className="text-2xl font-semibold mb-3">9. INFORMACIÓN PERSONAL</h2>
          <p className="mb-4">
            El tratamiento de los datos personales que el Usuario suministre a través del Sitio Web se rige por nuestra Política de Tratamiento de la Información y Datos Personales, la cual es parte integral de estos Términos y Condiciones. El Usuario declara haberla leído y aceptado. Puede consultarla{' '}
            <Link to="/politica-de-privacidad" className="text-primary hover:underline">
              aquí
            </Link>.
          </p>

          <h2 className="text-2xl font-semibold mb-3">10. Inexistencia de Garantía</h2>
          <p className="mb-4">
            El Sitio Web y todo su contenido se proporcionan "tal cual" y "según disponibilidad". PROENSE no ofrece garantías de ningún tipo, ni expresas ni implícitas, sobre la operatividad del Sitio o la información, contenido o materiales incluidos en el mismo. El Usuario acepta expresamente que el uso del Sitio Web es bajo su propio riesgo. PROENSE no garantiza que el Sitio Web esté libre de virus u otros componentes dañinos, ni que su funcionamiento sea ininterrumpido o libre de errores.
          </p>

          <h2 className="text-2xl font-semibold mb-3">11. LIBERACIÓN Y LIMITACIÓN DE RESPONSABILIDAD</h2>
          <p className="mb-4">
            En la máxima medida permitida por la ley aplicable, el Usuario acepta que PROENSE, sus directores, empleados o agentes, no serán responsables por ningún daño directo, indirecto, incidental, consecuencial o especial que surja de o esté relacionado con el uso o la imposibilidad de uso del Sitio Web. Esta liberación de responsabilidad incluye, sin limitación, daños por pérdida de datos, interrupción del negocio, errores, omisiones o cualquier otro perjuicio, incluso si PROENSE hubiese sido advertido de la posibilidad de dichos daños.
          </p>

          <h2 className="text-2xl font-semibold mb-3">12. LEGISLACIÓN APLICABLE Y JURISDICCIÓN</h2>
          <p className="mb-4">
            Estos Términos y Condiciones se rigen e interpretan en su totalidad por las leyes de la República de Colombia. Cualquier controversia que surja de su interpretación o aplicación será sometida a la jurisdicción de los jueces y tribunales competentes de la ciudad de Pereira, Risaralda, renunciando el Usuario a cualquier otro fuero que pudiera corresponderle.
          </p>
        </div>
      </section>
    </Layout>
  );
};

export default TerminosCondicionesPage;
