import React from 'react';
import Layout from '@/components/layout/Layout';

const PoliticaPrivacidadPage: React.FC = () => {
  return (
    <Layout handleOpenLeadDialog={() => { /* No lead dialog needed for this page */ }}>
      {/* Hero Section */}
      <section className="bg-primary text-white py-12 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold">Política de Privacidad</h1>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">1. Introducción y Responsable del Tratamiento</h2>
        <p className="mb-2">
          Bienvenido a [Nombre de la Empresa Asesora de Seguros] (en adelante, "la Compañía", "nosotros"). Con NIT [Número de NIT], domiciliada en [Dirección Completa, Ciudad, Colombia], y correo electrónico de contacto [correo electrónico de contacto], somos responsables del tratamiento de sus datos personales.
        </p>
        <p className="mb-2">
          Esta Política de Privacidad describe cómo recolectamos, usamos, almacenamos, circulamos y suprimimos la información personal de nuestros usuarios y clientes, en cumplimiento de la Ley Estatutaria 1581 de 2012, el Decreto 1377 de 2013, y demás normas concordantes sobre protección de datos personales en Colombia.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">2. Definiciones Clave</h2>
        <ul className="list-disc list-inside mb-2">
          <li><strong>Dato Personal:</strong> Cualquier información vinculada o que pueda asociarse a una o varias personas naturales determinadas o determinables.</li>
          <li><strong>Titular:</strong> Persona natural cuyos datos personales sean objeto de Tratamiento.</li>
          <li><strong>Tratamiento:</strong> Cualquier operación o conjunto de operaciones sobre datos personales, tales como la recolección, almacenamiento, uso, circulación o supresión.</li>
          <li><strong>Responsable del Tratamiento:</strong> Persona natural o jurídica, pública o privada, que por sí misma o en asocio con otros, decida sobre la base de datos y/o el Tratamiento de los datos. Para efectos de esta política, [Nombre de la Empresa Asesora de Seguros] es el Responsable.</li>
          <li><strong>Encargado del Tratamiento:</strong> Persona natural o jurídica, pública o privada, que por sí misma o en asocio con otros, realice el Tratamiento de datos personales por cuenta del Responsable del Tratamiento.</li>
          <li><strong>Autorización:</strong> Consentimiento previo, expreso e informado del Titular para llevar a cabo el Tratamiento de datos personales.</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">3. Principios para el Tratamiento de Datos Personales</h2>
        <p className="mb-2">
          El tratamiento de sus datos personales se realizará de conformidad con los siguientes principios:
        </p>
        <ul className="list-disc list-inside mb-2">
          <li><strong>Legalidad en materia de Tratamiento de datos:</strong> El Tratamiento a que se refiere la presente política es una actividad reglada que debe sujetarse a lo establecido en ella y en las demás disposiciones que la desarrollen.</li>
          <li><strong>Finalidad:</strong> El Tratamiento debe obedecer a una finalidad legítima de acuerdo con la Constitución y la Ley, la cual debe ser informada al Titular.</li>
          <li><strong>Libertad:</strong> El Tratamiento sólo puede ejercerse con el consentimiento, previo, expreso e informado del Titular. Los datos personales no podrán ser obtenidos o divulgados sin previa autorización, o en ausencia de mandato legal o judicial que releve el consentimiento.</li>
          <li><strong>Veracidad o calidad:</strong> La información sujeta a Tratamiento debe ser veraz, completa, exacta, actualizada, comprobable y comprensible. Se prohíbe el Tratamiento de datos parciales, incompletos, fraccionados o que induzcan a error.</li>
          <li><strong>Transparencia:</strong> En el Tratamiento debe garantizarse el derecho del Titular a obtener del Responsable del Tratamiento o del Encargado del Tratamiento, en cualquier momento y sin restricciones, información acerca de la existencia de datos que le conciernan.</li>
          <li><strong>Acceso y circulación restringida:</strong> El Tratamiento se sujeta a los límites que se derivan de la naturaleza de los datos personales, de las disposiciones de la presente ley y la Constitución.</li>
          <li><strong>Seguridad:</strong> La información sujeta a Tratamiento por el Responsable del Tratamiento o Encargado del Tratamiento se deberá manejar con las medidas técnicas, humanas y administrativas que sean necesarias para otorgar seguridad a los registros evitando su adulteración, pérdida, consulta, uso o acceso no autorizado o fraudulento.</li>
          <li><strong>Confidencialidad:</strong> Todas las personas que intervengan en el Tratamiento de datos personales que no tengan la naturaleza de públicos están obligadas a garantizar la reserva de la información, inclusive después de finalizada su relación con alguna de las labores que comprende el Tratamiento.</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">4. Finalidades del Tratamiento de Datos Personales</h2>
        <p className="mb-2">
          Sus datos personales serán tratados para las siguientes finalidades:
        </p>
        <ul className="list-disc list-inside mb-2">
          <li>Prestar nuestros servicios de intermediación de seguros, incluyendo la cotización, comparación, asesoría, y facilitación en la contratación de pólizas de seguros.</li>
          <li>Gestionar la relación contractual y/o comercial con usted.</li>
          <li>Realizar comunicaciones informativas, comerciales y publicitarias relacionadas con nuestros productos, servicios, ofertas, promociones, alianzas, estudios, concursos, contenidos, así como de compañías aliadas, siempre que contemos con su autorización.</li>
          <li>Evaluar la calidad de nuestros servicios y realizar estudios de mercado.</li>
          <li>Atender sus peticiones, quejas, reclamos y sugerencias (PQRS).</li>
          <li>Cumplir con obligaciones legales y contractuales, incluyendo requerimientos de autoridades competentes.</li>
          <li>Realizar análisis estadísticos y de comportamiento de uso de nuestros servicios y sitio web.</li>
          <li>Prevenir fraudes y gestionar riesgos.</li>
          <li>[Añadir otras finalidades específicas de su negocio]</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">5. Tipos de Datos Personales Recolectados</h2>
        <p className="mb-2">
          Podemos recolectar, entre otros, los siguientes datos personales:
        </p>
        <ul className="list-disc list-inside mb-2">
          <li><strong>Datos de identificación:</strong> Nombre completo, tipo y número de documento de identidad, fecha de nacimiento, género, nacionalidad.</li>
          <li><strong>Datos de contacto:</strong> Dirección de residencia, correo electrónico, número de teléfono fijo y/o celular.</li>
          <li><strong>Datos financieros:</strong> Información necesaria para la cotización y contratación de seguros (ej. información sobre bienes a asegurar, ingresos, historial crediticio si es pertinente y autorizado).</li>
          <li><strong>Datos sensibles:</strong> (Si aplica, por ejemplo, datos de salud para seguros de vida o salud). En caso de recolectar datos sensibles, solicitaremos su autorización expresa, informándole sobre el carácter facultativo de su respuesta.</li>
          <li><strong>Datos de navegación:</strong> Dirección IP, tipo de navegador, páginas visitadas en nuestro sitio web, tiempo de permanencia, cookies (ver política de cookies si existe).</li>
          <li>[Añadir otros tipos de datos específicos que recolecten]</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">6. Derechos de los Titulares de los Datos</h2>
        <p className="mb-2">
          Como Titular de sus datos personales, usted tiene derecho a:
        </p>
        <ul className="list-disc list-inside mb-2">
          <li>Conocer, actualizar y rectificar sus datos personales frente a nosotros como Responsables del Tratamiento.</li>
          <li>Solicitar prueba de la autorización otorgada para el tratamiento de sus datos, salvo las excepciones legales.</li>
          <li>Ser informado, previa solicitud, respecto del uso que se le ha dado a sus datos personales.</li>
          <li>Presentar ante la Superintendencia de Industria y Comercio quejas por infracciones a lo dispuesto en la Ley 1581 de 2012 y demás normas que la modifiquen, adicionen o complementen.</li>
          <li>Revocar la autorización y/o solicitar la supresión del dato cuando en el Tratamiento no se respeten los principios, derechos y garantías constitucionales y legales. La revocatoria y/o supresión procederá cuando la Superintendencia de Industria y Comercio haya determinado que en el Tratamiento el Responsable o Encargado han incurrido en conductas contrarias a esta ley y a la Constitución.</li>
          <li>Acceder en forma gratuita a sus datos personales que hayan sido objeto de Tratamiento.</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">7. Procedimiento para Ejercer los Derechos</h2>
        <p className="mb-2">
          Para el ejercicio de sus derechos (consultas, reclamos, rectificación, actualización, supresión o revocatoria de la autorización), usted podrá contactarnos a través de:
        </p>
        <ul className="list-disc list-inside mb-2">
          <li>Correo electrónico: [correo electrónico para ejercicio de derechos]</li>
          <li>Dirección física: [Dirección física para correspondencia]</li>
          <li>Teléfono: [Número de teléfono de contacto]</li>
        </ul>
        <p className="mb-2">
          Su solicitud deberá contener como mínimo: nombre completo del titular, número de identificación, descripción de los hechos que dan lugar a la solicitud, dirección de notificación y documentos que desee adjuntar.
        </p>
        <p className="mb-2">
          Las consultas serán atendidas en un término máximo de diez (10) días hábiles contados a partir de la fecha de recibo. Cuando no fuere posible atender la consulta dentro de dicho término, se informará al interesado, expresando los motivos de la demora y señalando la fecha en que se atenderá su consulta, la cual en ningún caso podrá superar los cinco (5) días hábiles siguientes al vencimiento del primer término.
        </p>
        <p className="mb-2">
          Los reclamos para corrección, actualización, supresión o revocatoria serán atendidos en un término máximo de quince (15) días hábiles contados a partir del día siguiente a la fecha de su recibo. Cuando no fuere posible atender el reclamo dentro de dicho término, se informará al interesado los motivos de la demora y la fecha en que se atenderá su reclamo, la cual en ningún caso podrá superar los ocho (8) días hábiles siguientes al vencimiento del primer término.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">8. Seguridad de la Información</h2>
        <p className="mb-2">
          Hemos implementado medidas técnicas, humanas y administrativas necesarias para garantizar la seguridad de sus datos personales, evitando su adulteración, pérdida, consulta, uso o acceso no autorizado o fraudulento. Estas medidas incluyen [Mencionar brevemente tipos de medidas, ej: controles de acceso, copias de seguridad, cifrado si aplica].
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">9. Transferencia y Transmisión de Datos Personales</h2>
        <p className="mb-2">
          [Si aplica: Describir si se realizan transferencias (a países sin nivel adecuado de protección) o transmisiones (a encargados) de datos, y bajo qué condiciones y finalidades, asegurando el cumplimiento de la ley colombiana. Si no aplica, indicar que no se realizan o que solo se harán con autorización expresa o excepciones legales.]
        </p>
        <p className="mb-2">
          Ejemplo: Podremos compartir su información con compañías aseguradoras para la cotización y emisión de pólizas, con proveedores de servicios tecnológicos que nos asisten en la operación, o con autoridades competentes, siempre bajo el amparo de la ley y/o su autorización.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">10. Uso de Cookies</h2>
        <p className="mb-2">
          Nuestro sitio web utiliza cookies para mejorar su experiencia de navegación, recordar sus preferencias y obtener estadísticas de uso. Puede configurar su navegador para rechazar las cookies, aunque esto podría afectar la funcionalidad de algunas partes del sitio. Para más información, consulte nuestra [Política de Cookies] (si la tiene por separado, de lo contrario, detallar aquí).
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">11. Vigencia de la Política y de las Bases de Datos</h2>
        <p className="mb-2">
          La presente Política de Privacidad rige a partir del [Fecha de entrada en vigencia]. Los datos personales proporcionados se conservarán mientras se mantenga la finalidad para la cual fueron recolectados, o por los términos legales o contractuales que establezcan su permanencia.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">12. Modificaciones a la Política de Privacidad</h2>
        <p className="mb-2">
          Nos reservamos el derecho de modificar esta Política de Privacidad en cualquier momento. Cualquier cambio será informado y publicado oportunamente en nuestro sitio web. El uso continuado de nuestros servicios después de la publicación de los cambios constituirá su aceptación de los mismos.
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

  export default PoliticaPrivacidadPage;
