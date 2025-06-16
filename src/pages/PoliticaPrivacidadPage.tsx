import React from 'react';
import Layout from '@/components/layout/Layout';

interface PoliticaPrivacidadPageProps {
  handleOpenLeadDialog: () => void;
}

const PoliticaPrivacidadPage: React.FC<PoliticaPrivacidadPageProps> = ({ handleOpenLeadDialog }) => {
  return (
    <Layout handleOpenLeadDialog={handleOpenLeadDialog}>
      {/* Hero Section */}
      <section className="bg-primary text-white py-12 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold">Política de Privacidad</h1>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">

          <p className="mb-4 text-sm text-gray-600">Versión 1.0 Fecha de Entrada en Vigor: 16 de Junio de 2025</p>

          <section className="mb-6">
              <h2 className="text-2xl font-semibold mb-3">1. OBJETO Y ÁMBITO DE APLICACIÓN</h2>
              <p className="mb-2">
                  El presente documento constituye la Política de Tratamiento de Información y Datos Personales de PROENSE AGENCIA DE SEGUROS LTDA (en adelante, el “Responsable” o “PROENSE”). Ha sido elaborada en estricto cumplimiento del régimen de protección de datos personales consagrado en la Ley 1581 de 2012, el Decreto 1377 de 2013 y demás normas concordantes.
              </p>
              <p className="mb-2">
                  Esta política se aplica a todo tratamiento de datos de carácter personal que PROENSE realice, y es de obligatorio cumplimiento para todos sus empleados, contratistas y terceros con quienes se mantenga una relación que implique el tratamiento de datos personales contenidos en las bases de datos de la compañía.
              </p>
          </section>

          <section className="mb-6">
              <h2 className="text-2xl font-semibold mb-3">2. IDENTIFICACIÓN DEL RESPONSABLE DEL TRATAMIENTO</h2>
              <ul className="list-none mb-2 space-y-1">
                  <li><strong>Razón Social:</strong> PROENSE AGENCIA DE SEGUROS LTDA</li>
                  <li><strong>NIT:</strong> 901.915.787-3</li>
                  <li><strong>Domicilio y Dirección Principal:</strong> CR 20 2 06, Pereira, Risaralda, República de Colombia.</li>
                  <li>
                    <strong>Canal de Atención (Consultas y Reclamos):</strong>
                    <ul className="list-none ml-4 mt-1">
                      <li><strong>Correo Electrónico:</strong> comercial@proense.co</li>
                      <li><strong>Teléfono:</strong> +573113776655</li>
                    </ul>
                  </li>
              </ul>
          </section>

          <section className="mb-6">
              <h2 className="text-2xl font-semibold mb-3">3. MARCO CONCEPTUAL Y DEFINICIONES</h2>
              <p className="mb-2">Para la correcta interpretación de esta política, se adoptan las siguientes definiciones legales:</p>
              <ul className="list-disc list-inside mb-2 space-y-1">
                  <li><strong>Titular:</strong> Persona natural cuyos datos personales son objeto de Tratamiento.</li>
                  <li><strong>Dato Personal:</strong> Cualquier información vinculada o que pueda asociarse a una o varias personas naturales determinadas o determinables.</li>
                  <li><strong>Dato Sensible:</strong> Aquellos datos que afectan la intimidad del Titular o cuyo uso indebido puede generar su discriminación (ej: datos relativos a la salud, origen racial o étnico, vida sexual, datos biométricos).</li>
                  <li><strong>Tratamiento:</strong> Cualquier operación sobre datos personales, como la recolección, almacenamiento, uso, circulación o supresión.</li>
                  <li><strong>Autorización:</strong> Consentimiento previo, expreso e informado del Titular para llevar a cabo el Tratamiento de sus datos personales.</li>
                  <li><strong>Base de Datos:</strong> Conjunto organizado de datos personales que sea objeto de Tratamiento.</li>
                  <li><strong>Transferencia:</strong> Envío de datos personales a un receptor que, a su vez, es Responsable del Tratamiento y se encuentra dentro o fuera del país.</li>
                  <li><strong>Transmisión:</strong> Tratamiento de datos personales que implica la comunicación de los mismos dentro o fuera del territorio colombiano, cuando tenga por objeto la realización de un Tratamiento por el Encargado por cuenta del Responsable.</li>
              </ul>
          </section>

          <section className="mb-6">
              <h2 className="text-2xl font-semibold mb-3">4. PRINCIPIOS RECTORES</h2>
              <p className="mb-2">El tratamiento de datos personales por parte de PROENSE se regirá por los principios de: legalidad, finalidad, libertad, veracidad o calidad, transparencia, acceso y circulación restringida, seguridad y confidencialidad.</p>
          </section>

          <section className="mb-6">
              <h2 className="text-2xl font-semibold mb-3">5. TRATAMIENTO AL CUAL SERÁN SOMETIDOS LOS DATOS Y FINALIDAD DEL MISMO</h2>
              <p className="mb-2">PROENSE, en su calidad de intermediario de seguros, requiere recolectar, almacenar, usar y transferir datos personales para el desarrollo de su objeto social. El tratamiento de datos se fundamenta en la autorización previa, expresa e informada del Titular, la cual será obtenida por medios físicos o electrónicos que permitan su posterior consulta.</p>
              <p className="mb-2">Las finalidades para las cuales serán tratados sus datos son las siguientes:</p>
              <h3 className="text-xl font-semibold mt-4 mb-2">A. Finalidades Inherentes a la Actividad de Intermediación de Seguros:</h3>
              <ul className="list-disc list-inside mb-2 space-y-1">
                  <li>Realizar la gestión de análisis de riesgo y la estructuración de programas de seguros adecuados al perfil del Titular.</li>
                  <li>Transferir la información personal, financiera y sensible del Titular a las compañías aseguradoras, reaseguradoras y/o afianzadoras con el fin de que estas puedan evaluar el riesgo, generar cotizaciones, emitir, modificar o renovar las pólizas de seguro solicitadas. El Titular entiende y acepta que esta transferencia es un elemento esencial e indispensable para la prestación del servicio de intermediación.</li>
                  <li>Administrar la relación contractual, incluyendo la gestión de pagos de primas y la ejecución de los contratos de seguro.</li>
                  <li>Prestar asesoría y acompañamiento integral en caso de siniestro, lo cual implica compartir la información pertinente con ajustadores, abogados, centros de servicios y demás actores del proceso de reclamación.</li>
                  <li>Dar cumplimiento a obligaciones legales, incluyendo, pero sin limitarse a, reportes a autoridades de control y vigilancia y la implementación del Sistema de Administración del Riesgo de Lavado de Activos y Financiación del Terrorismo (SARLAFT).</li>
              </ul>
              <h3 className="text-xl font-semibold mt-4 mb-2">B. Otras Finalidades:</h3>
              <ul className="list-disc list-inside mb-2 space-y-1">
                  <li>Contactar al Titular para ofrecer nuevos productos o servicios del portafolio de PROENSE que puedan ser de su interés.</li>
                  <li>Realizar encuestas de satisfacción, estudios de mercado y análisis estadísticos para la mejora del servicio.</li>
                  <li>Enviar comunicaciones comerciales, boletines informativos y material publicitario a través de correo electrónico, SMS o canales análogos.</li>
              </ul>
          </section>

          <section className="mb-6">
              <h2 className="text-2xl font-semibold mb-3">6. TRATAMIENTO DE DATOS SENSIBLES</h2>
              <p className="mb-2">El tratamiento de datos sensibles (ej: información de salud para seguros de vida o salud) se realizará únicamente cuando sea estrictamente necesario para la estructuración y cotización de un producto de seguro, y requerirá de la autorización explícita, previa e informada del Titular, informándole que no está obligado a autorizar su tratamiento. Dichos datos serán manejados con los más altos estándares de seguridad y confidencialidad.</p>
          </section>

          <section className="mb-6">
              <h2 className="text-2xl font-semibold mb-3">7. DERECHOS QUE ASISTEN AL TITULAR (HABEAS DATA)</h2>
              <p className="mb-2">Conforme al artículo 8 de la Ley 1581 de 2012, el Titular de los datos personales tiene los siguientes derechos:</p>
              <ul className="list-disc list-inside mb-2 space-y-1" style={{ listStyleType: 'lower-alpha' }}>
                  <li>Conocer, actualizar y rectificar sus datos personales frente a PROENSE.</li>
                  <li>Solicitar prueba de la autorización otorgada.</li>
                  <li>Ser informado por PROENSE, previa solicitud, respecto del uso que se le ha dado a sus datos.</li>
                  <li>Presentar quejas ante la Superintendencia de Industria y Comercio por infracciones a lo dispuesto en la ley.</li>
                  <li>Revocar la autorización y/o solicitar la supresión del dato cuando en el Tratamiento no se respeten los principios, derechos y garantías constitucionales y legales.</li>
                  <li>Acceder en forma gratuita a sus datos personales que hayan sido objeto de Tratamiento.</li>
              </ul>
          </section>

          <section className="mb-6">
              <h2 className="text-2xl font-semibold mb-3">8. PROCEDIMIENTO PARA EL EJERCICIO DE LOS DERECHOS</h2>
              <p className="mb-2">El Titular o sus causahabientes podrán ejercer sus derechos a través de los canales de atención definidos en el numeral 2 de esta política. La solicitud deberá contener:</p>
              <ul className="list-disc list-inside mb-2 space-y-1">
                  <li>Identificación completa del Titular.</li>
                  <li>Descripción precisa de los hechos que dan lugar a la consulta o reclamo.</li>
                  <li>Dirección física o electrónica para recibir notificaciones.</li>
                  <li>Documentos que se quieran hacer valer.</li>
              </ul>
              <h3 className="text-lg font-semibold mt-4 mb-2">Términos de Respuesta:</h3>
              <ul className="list-disc list-inside mb-2 space-y-1">
                  <li><strong>Consultas:</strong> Serán atendidas en un término máximo de diez (10) días hábiles.</li>
                  <li><strong>Reclamos:</strong> Serán atendidos en un término máximo de quince (15) días hábiles.</li>
              </ul>
          </section>

          <section className="mb-6">
              <h2 className="text-2xl font-semibold mb-3">9. MEDIDAS DE SEGURIDAD</h2>
              <p className="mb-2">PROENSE ha implementado medidas técnicas, humanas y administrativas idóneas y necesarias para garantizar la seguridad de los datos personales, evitando su adulteración, pérdida, consulta, uso o acceso no autorizado o fraudulento.</p>
          </section>

          <section className="mb-6">
              <h2 className="text-2xl font-semibold mb-3">10. VIGENCIA DE LA POLÍTICA Y PERIODO DE VIGENCIA DE LA BASE DE DATOS</h2>
              <p className="mb-2">La presente política rige a partir de su fecha de publicación. Las bases de datos que contienen datos personales tendrán una vigencia igual al periodo en que se mantenga la finalidad para la cual los datos fueron recolectados, más el tiempo adicional exigido por la normativa legal aplicable para el cumplimiento de obligaciones contables, fiscales y contractuales. Cualquier modificación sustancial a esta política será comunicada oportunamente a los Titulares.</p>
          </section>

          <section className="mb-6">
              <h2 className="text-2xl font-semibold mb-3">11. USO DE TECNOLOGÍAS DE RASTREO Y COOKIES</h2>
              <p className="mb-2">El sitio web de PROENSE puede hacer uso de cookies y otras tecnologías de rastreo similares (en adelante, "Cookies") para facilitar la navegación, mejorar la experiencia del usuario y realizar análisis estadísticos. Las Cookies son archivos de datos que se instalan en el dispositivo del Titular y que permiten recolectar información como la dirección IP, el tipo de navegador, las páginas visitadas y la duración de la sesión.</p>
              <p className="mb-2">El tratamiento de la información recolectada a través de estas tecnologías tiene las siguientes finalidades:</p>
              <ul className="list-disc list-inside mb-2 space-y-1">
                  <li><strong>Técnicas:</strong> Garantizar el correcto funcionamiento del sitio web y la seguridad de la navegación.</li>
                  <li><strong>Analíticas:</strong> Medir la actividad de los usuarios y analizar el tráfico web para la optimización de nuestros servicios y plataformas digitales.</li>
                  <li><strong>De Personalización:</strong> Recordar las preferencias del usuario para ofrecer una experiencia más ágil y personalizada en futuras visitas.</li>
              </ul>
              <p className="mb-2">El Titular tiene el control sobre estas tecnologías y puede configurar su navegador para aceptar, rechazar o eliminar las Cookies. Sin embargo, se le informa que la desactivación de ciertas Cookies podría afectar o limitar la funcionalidad total o parcial de nuestro sitio web. La permanencia en el sitio web constituye una aceptación tácita del uso de las Cookies indispensables para su funcionamiento.</p>
          </section>

          <section className="mb-6">
              <h2 className="text-2xl font-semibold mb-3">12. MODIFICACIONES A LA POLÍTICA</h2>
              <p className="mb-2">PROENSE se reserva el derecho de modificar, en cualquier momento y de forma unilateral, la presente Política de Tratamiento de la Información. Cualquier modificación será motivada por cambios en la normativa aplicable, nuevas directrices jurisprudenciales o políticas internas de la compañía.</p>
              <p className="mb-2">De conformidad con el Decreto 1377 de 2013, toda modificación sustancial a esta política, referida a la identificación del Responsable o a la finalidad del tratamiento que afecte el contenido de la autorización, será comunicada oportunamente a los Titulares antes de su implementación. Dicha comunicación se realizará a través del sitio web oficial de la compañía o mediante correo electrónico a los Titulares que así lo hayan autorizado.</p>
              <p className="mb-2">La versión actualizada de la política siempre estará disponible para su consulta en el sitio web de PROENSE.</p>
          </section>
          </div>
        </section>
      </Layout>
    );
  };

  export default PoliticaPrivacidadPage;
