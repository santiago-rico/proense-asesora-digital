
import React from "react";
import Layout from "@/components/layout/Layout";
import LeadForm from "@/components/forms/LeadForm";
import { Phone, Mail, Facebook, Instagram } from "lucide-react";
import OptimizedImage from "@/components/shared/OptimizedImage";

interface ContactPageProps {
  handleOpenLeadDialog: () => void;
}

const ContactPage: React.FC<ContactPageProps> = ({ handleOpenLeadDialog }) => {
  return (
    <Layout handleOpenLeadDialog={handleOpenLeadDialog}>
      {/* Hero Section */}
      <div className="relative text-white py-24 md:py-32 overflow-hidden">
        <OptimizedImage
          src="/images/hero-contact.jpg"
          alt="Contacto Proense Seguros"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: 'center 15%' }}
          loading="eager"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">
            Estamos para Servirte
          </h1>
          <p className="text-lg md:text-xl text-center max-w-3xl mx-auto">
            Conéctate con nosotros. En Proense Seguros, tu tranquilidad es nuestra prioridad. Contáctanos hoy mismo y descubre cómo podemos ayudarte.
          </p>
        </div>
      </div>

      {/* Contact Information & Form */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Contact Info & Social */}
          <div className="md:col-span-4 md:col-start-2">
            <h2 className="text-3xl font-bold mb-8 text-primary">Nuestros Canales</h2>
            
            <div className="space-y-6 mb-10">
              <div className="flex items-center">
                <div className="mr-4 bg-primary/10 p-3 rounded-full">
                  <Phone className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">Teléfono Directo</h3>
                  <a href="tel:+573155862884" className="text-gray-700 hover:text-primary text-lg">
                    +57 315 586 2884
                  </a>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="mr-4 bg-primary/10 p-3 rounded-full">
                  <Mail className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">Correo Electrónico</h3>
                  <a href="mailto:comercial@proense.co" className="text-gray-700 hover:text-primary text-lg">
                    comercial@proense.co
                  </a>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold mb-6 text-primary">Síguenos en Redes</h3>
              <div className="flex space-x-6">
                <a 
                  href="https://www.facebook.com/proense" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-600 hover:text-primary transform hover:scale-110 transition-transform duration-200"
                  aria-label="Facebook Proense Seguros"
                >
                  <Facebook className="h-10 w-10" />
                </a>
                <a 
                  href="https://www.instagram.com/proense_seguros/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-600 hover:text-primary transform hover:scale-110 transition-transform duration-200"
                  aria-label="Instagram Proense Seguros"
                >
                  <Instagram className="h-10 w-10" />
                </a>
                <a 
                  href="https://api.whatsapp.com/send?phone=573155862884&text=Hola%2C%20me%20gustar%C3%ADa%20agendar%20una%20cita%20para%20recibir%20asesor%C3%ADa%20de%20Proense%20Seguros%20%F0%9F%98%83" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-600 hover:text-primary transform hover:scale-110 transition-transform duration-200"
                  aria-label="WhatsApp Proense Seguros"
                >
                  <svg className="h-10 w-10" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.498 14.382v-.002c-.301-.15-1.767-.867-2.04-.966-.274-.101-.473-.15-.673.15-.197.295-.771.963-.944 1.16-.174.196-.349.223-.644.075-.3-.15-1.263-.465-2.404-1.485-.888-.794-1.484-1.76-1.66-2.06-.172-.29-.018-.448.13-.594.136-.135.3-.345.451-.523.146-.18.194-.3.29-.494.1-.21.049-.375-.025-.523-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.516-.173-.009-.371-.01-.57-.01-.2 0-.523.074-.797.36-.273.3-1.046 1.02-1.046 2.475s1.07 2.865 1.219 3.075c.149.195 2.1 3.195 5.1 4.485.71.3 1.263.48 1.694.615.713.226 1.36.195 1.871.118.57-.09 1.76-.721 2.002-1.426.248-.705.248-1.29.173-1.425-.074-.135-.27-.21-.57-.354m-5.447 7.443h-.016c-1.77 0-3.524-.48-5.055-1.38l-.36-.214-3.75.975 1.005-3.645-.239-.375a9.878 9.878 0 01-1.52-5.26c.001-5.445 4.493-9.885 10-9.885 2.654 0 5.14 1.035 7.021 2.91 1.88 1.859 2.925 4.35 2.92 6.99-.004 5.444-4.494 9.885-10.011 9.885M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.334.101 11.893c-.002 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652c1.746.943 3.71 1.444 5.71 1.447h.006c6.585 0 11.946-5.336 11.949-11.896 0-3.176-1.24-6.165-3.495-8.411"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          
          {/* Right Column: Lead Form */}
          <div className="bg-gray-50 p-6 md:p-8 rounded-lg shadow-xl md:col-span-6">
            <div className="mb-6">
              <h3 className="text-2xl md:text-3xl font-bold mb-3 text-primary text-center md:text-left">Hablemos de tu Protección</h3>
              <p className="text-md text-gray-700 text-center md:text-left">
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
