
import React from "react";
import Layout from "@/components/layout/Layout";
import LeadForm from "@/components/forms/LeadForm";
import { Phone, Mail } from "lucide-react";
import { FacebookIcon, InstagramIcon, WhatsAppIcon } from "@/components/shared/SocialIcons";
import OptimizedImage from "@/components/shared/OptimizedImage";

interface ContactPageProps {
  handleOpenLeadDialog: () => void;
}

const ContactPage: React.FC<ContactPageProps> = ({ handleOpenLeadDialog }) => {
  return (
    <Layout handleOpenLeadDialog={handleOpenLeadDialog}>
      {/* Hero Section */}
      <div className="relative text-white py-16 sm:py-20 md:py-24 lg:py-32 overflow-hidden">
        <OptimizedImage
          src="/images/hero-contact.avif"
          alt="Contacto Proense Seguros"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: 'center 15%' }}
          loading="eager"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-center">
            Estamos para Servirte
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-center max-w-3xl mx-auto">
            Conéctate con nosotros. En Proense Seguros, tu tranquilidad es nuestra prioridad. Contáctanos hoy mismo y descubre cómo podemos ayudarte.
          </p>
        </div>
      </div>

      {/* Contact Information & Form */}
      <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-12 lg:gap-16 items-start">
          {/* Left Column: Contact Info & Social */}
          <div className="md:col-span-4 md:col-start-2">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-primary">Nuestros Canales</h2>
            
            <div className="space-y-4 sm:space-y-6 mb-8 sm:mb-10">
              <div className="flex items-center">
                <div className="mr-4 bg-primary/10 p-3 rounded-full">
                  <Phone className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-1">Teléfono Directo</h3>
                  <a href="tel:+573155862884" className="text-gray-700 hover:text-primary text-base sm:text-lg">
                    +57 315 586 2884
                  </a>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="mr-4 bg-primary/10 p-3 rounded-full">
                  <Mail className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-1">Correo Electrónico</h3>
                  <a href="mailto:comercial@proense.co" className="text-gray-700 hover:text-primary text-base sm:text-lg">
                    comercial@proense.co
                  </a>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-primary">Síguenos en Redes</h3>
              <div className="flex space-x-4 sm:space-x-6">
                <a 
                  href="https://www.facebook.com/proense" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-600 hover:text-primary transform hover:scale-110 transition-transform duration-200"
                  aria-label="Facebook Proense Seguros"
                >
                  <FacebookIcon className="h-10 w-10" />
                </a>
                <a 
                  href="https://www.instagram.com/proense_seguros/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-600 hover:text-primary transform hover:scale-110 transition-transform duration-200"
                  aria-label="Instagram Proense Seguros"
                >
                  <InstagramIcon className="h-10 w-10" />
                </a>
                <a 
                  href="https://api.whatsapp.com/send?phone=573155862884&text=Hola%2C%20me%20gustar%C3%ADa%20agendar%20una%20cita%20para%20recibir%20asesor%C3%ADa%20de%20Proense%20Seguros%20%F0%9F%98%83" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-600 hover:text-primary transform hover:scale-110 transition-transform duration-200"
                  aria-label="WhatsApp Proense Seguros"
                >
                  <WhatsAppIcon className="h-10 w-10" />
                </a>
              </div>
            </div>
          </div>
          
          {/* Right Column: Lead Form */}
          <div className="bg-gray-50 p-4 sm:p-6 md:p-8 rounded-lg shadow-xl md:col-span-6">
            <div className="mb-6">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 text-primary text-center md:text-left">Hablemos de tu Protección</h3>
              <p className="text-sm sm:text-base text-gray-700 text-center md:text-left">
                Tu tranquilidad es nuestra prioridad. Completa el formulario y un asesor experto de Proense Seguros se comunicará contigo a la brevedad para brindarte la asesoría personalizada que mereces.
              </p>
            </div>
            <LeadForm />
          </div>
        </div>
      </div>
    </Layout>
  );

};

export default ContactPage;
