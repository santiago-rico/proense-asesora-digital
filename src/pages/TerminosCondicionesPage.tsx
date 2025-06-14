import React from 'react';
import Layout from '@/components/layout/Layout';

const TerminosCondicionesPage: React.FC = () => {
  return (
    <Layout handleOpenLeadDialog={() => { /* No lead dialog needed for this page */ }}>
      {/* Hero Section */}
      <section className="bg-primary text-white py-12 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold">Términos y Condiciones</h1>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
    
      

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">1. Aceptación de los Términos</h2>
        <p className="mb-2">
          Bienvenido al sitio web de [Nombre de la Empresa Asesora de Seguros] (en adelante, "la Compañía", "nosotros"). Con NIT [Número de NIT], domiciliada en [Dirección Completa, Ciudad, Colombia].
        </p>
        <p className="mb-2">
          Estos Términos y Condiciones (en adelante, "Términos") rigen el acceso y uso de nuestro sitio web [URL del sitio web] (en adelante, "el Sitio Web") y los servicios de intermediación de seguros ofrecidos a través del mismo (en adelante, "los Servicios").
        </p>
        <p className="mb-2">
          Al acceder, navegar o utilizar el Sitio Web y/o los Servicios, usted (en adelante, "el Usuario") declara haber leído, entendido y aceptado de manera voluntaria e inequívoca la totalidad de estos Términos, así como nuestra Política de Privacidad. Si no está de acuerdo con estos Términos, por favor absténgase de utilizar el Sitio Web y los Servicios.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">2. Definiciones Clave</h2>
        <ul className="list-disc list-inside mb-2">
          <li><strong>Usuario:</strong> Toda persona natural o jurídica que acceda, navegue o utilice el Sitio Web y/o solicite o utilice los Servicios.</li>
          <li><strong>Sitio Web:</strong> La plataforma digital accesible a través de la URL [URL del sitio web] y todas sus páginas y contenidos asociados.</li>
          <li><strong>Servicios:</strong> Las actividades de intermediación de seguros, incluyendo la provisión de información, cotización, comparación, asesoría y facilitación en la contratación de pólizas de seguros con diversas compañías aseguradoras.</li>
          <li><strong>Compañía Aseguradora:</strong> Entidad legalmente autorizada en Colombia para expedir pólizas de seguros.</li>
          <li><strong>Póliza de Seguros:</strong> Contrato de seguro celebrado entre el Usuario (tomador/asegurado) y una Compañía Aseguradora.</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">3. Objeto de los Servicios</h2>
        <p className="mb-2">
          La Compañía actúa como un intermediario de seguros independiente, debidamente autorizado por la Superintendencia Financiera de Colombia (si aplica, o la entidad correspondiente). Nuestro objetivo es asesorar al Usuario de manera profesional e imparcial para ayudarle a encontrar soluciones de aseguramiento que se ajusten a sus necesidades y perfil de riesgo, facilitando el proceso de cotización y adquisición de pólizas de seguros ofrecidas por diversas Compañías Aseguradoras aliadas.
        </p>
        <p className="mb-2">
          La Compañía no es una entidad aseguradora y no asume riesgos de seguros. Las pólizas son emitidas directamente por las Compañías Aseguradoras, quienes son las únicas responsables por la cobertura, términos, condiciones y exclusiones de las mismas, así como del pago de siniestros.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">4. Capacidad Legal del Usuario</h2>
        <p className="mb-2">
          Los Servicios están dirigidos exclusivamente a personas mayores de edad (18 años en Colombia) con plena capacidad legal para contratar y obligarse según las leyes colombianas. Al utilizar los Servicios, el Usuario declara cumplir con este requisito.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">5. Obligaciones del Usuario</h2>
        <p className="mb-2">
          El Usuario se compromete a:
        </p>
        <ul className="list-disc list-inside mb-2">
          <li>Utilizar el Sitio Web y los Servicios de manera lícita, de buena fe y de acuerdo con estos Términos y la legislación colombiana.</li>
          <li>Proporcionar información veraz, completa, exacta y actualizada al momento de solicitar cotizaciones, asesoría o contratar pólizas de seguros. El Usuario es el único responsable por la exactitud de la información suministrada y por las consecuencias derivadas de su omisión, inexactitud o falsedad.</li>
          <li>Leer detenidamente toda la información proporcionada por la Compañía y por las Compañías Aseguradoras, incluyendo cotizaciones, condiciones generales y particulares de las pólizas, antes de tomar cualquier decisión de aseguramiento.</li>
          <li>No utilizar el Sitio Web para fines fraudulentos, ilegales o que puedan dañar la imagen o los derechos de la Compañía o de terceros.</li>
          <li>Custodiar diligentemente cualquier credencial de acceso (nombre de usuario, contraseña) que se le proporcione, siendo responsable por su uso indebido.</li>
          <li>Informar oportunamente a la Compañía sobre cualquier cambio en su información personal o en las circunstancias que puedan afectar sus seguros.</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">6. Información sobre Productos y Servicios de Seguros</h2>
        <p className="mb-2">
          La información sobre productos y servicios de seguros presentada en el Sitio Web tiene un carácter general e informativo. Las cotizaciones generadas son estimaciones basadas en la información proporcionada por el Usuario y están sujetas a la evaluación y aceptación final por parte de la Compañía Aseguradora respectiva.
        </p>
        <p className="mb-2">
          Los términos, condiciones, coberturas, exclusiones y primas finales de las pólizas de seguros son establecidos exclusivamente por cada Compañía Aseguradora y se encuentran detallados en los documentos contractuales de la póliza. Es responsabilidad del Usuario revisar cuidadosamente dichos documentos antes de la contratación.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">7. Proceso de Cotización y Contratación</h2>
        <p className="mb-2">
          El Sitio Web puede ofrecer herramientas para solicitar cotizaciones. El envío de una solicitud de cotización no implica la aceptación ni la obligación de emisión de una póliza por parte de la Compañía Aseguradora. La Compañía facilitará el contacto y la información necesaria para que el Usuario pueda, si así lo decide, contratar la póliza directamente con la Aseguradora o con nuestra asistencia.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">8. Propiedad Intelectual</h2>
        <p className="mb-2">
          Todo el contenido del Sitio Web, incluyendo pero no limitándose a textos, gráficos, logotipos, iconos, imágenes, software, diseño y código fuente, es propiedad de la Compañía o de sus licenciantes y está protegido por las leyes colombianas e internacionales sobre propiedad intelectual e industrial.
        </p>
        <p className="mb-2">
          Queda prohibida la reproducción, distribución, modificación, transmisión, publicación o cualquier otro uso no autorizado expresamente por escrito por la Compañía.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">9. Privacidad y Protección de Datos Personales</h2>
        <p className="mb-2">
          El tratamiento de los datos personales del Usuario se rige por nuestra <a href="/politica-de-privacidad" className="text-blue-600 hover:underline">Política de Privacidad</a>, la cual forma parte integral de estos Términos. Al aceptar estos Términos, el Usuario también acepta nuestra Política de Privacidad.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">10. Limitación de Responsabilidad</h2>
        <p className="mb-2">
          La Compañía actúa con la debida diligencia profesional en la prestación de sus Servicios de intermediación. Sin embargo, no garantiza que el Sitio Web esté libre de errores o interrupciones, ni se responsabiliza por:
        </p>
        <ul className="list-disc list-inside mb-2">
          <li>Decisiones tomadas por el Usuario basadas exclusivamente en la información del Sitio Web sin la debida asesoría personalizada.</li>
          <li>El contenido, términos o cumplimiento de las pólizas emitidas por las Compañías Aseguradoras.</li>
          <li>Daños directos o indirectos que puedan surgir del uso o imposibilidad de uso del Sitio Web o los Servicios, salvo que medie dolo o culpa grave de la Compañía.</li>
          <li>Información incorrecta, incompleta o desactualizada proporcionada por el Usuario.</li>
          <li>Fallas técnicas, virus informáticos o cualquier otro elemento dañino que pueda afectar el equipo del Usuario como consecuencia del acceso o uso del Sitio Web.</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">11. Modificaciones a los Términos y Condiciones</h2>
        <p className="mb-2">
          La Compañía se reserva el derecho de modificar estos Términos en cualquier momento. Cualquier cambio será publicado en el Sitio Web y entrará en vigor desde su publicación. Se recomienda al Usuario revisar periódicamente estos Términos. El uso continuado del Sitio Web o los Servicios después de la publicación de los cambios constituirá la aceptación de los mismos.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">12. Ley Aplicable y Jurisdicción</h2>
        <p className="mb-2">
          Estos Términos se rigen por las leyes de la República de Colombia. Cualquier controversia derivada de su interpretación o aplicación será sometida a la jurisdicción de los tribunales competentes de [Ciudad de Domicilio de la Empresa], Colombia, o a los mecanismos de resolución de conflictos previstos en la ley colombiana, como la Superintendencia de Industria y Comercio para asuntos de protección al consumidor, o la Superintendencia Financiera de Colombia para asuntos relacionados con la actividad aseguradora y de intermediación, según corresponda.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">13. Comunicaciones</h2>
        <p className="mb-2">
          Cualquier comunicación relacionada con estos Términos o los Servicios deberá dirigirse a:
        </p>
        <p className="mb-2">
          [Nombre de la Empresa Asesora de Seguros]<br />
          Atención: Departamento Legal / Servicio al Cliente<br />
          Dirección: [Dirección Completa]<br />
          Correo electrónico: [correo electrónico de contacto para términos y condiciones]
        </p>
      </section>

      <p className="mt-8 text-sm text-gray-600">
        <strong>Última actualización:</strong> [Fecha de la última actualización]
      </p>
      </div>
    </section>
  </Layout>
  );
};

export default TerminosCondicionesPage;
