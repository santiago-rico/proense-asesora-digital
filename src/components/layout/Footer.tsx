
import React from "react";
import { Link } from "react-router-dom";
import { Phone, Mail, Home } from "lucide-react";
import OptimizedImage from "@/components/shared/OptimizedImage";

const Footer: React.FC = () => {
  return (
    <footer id="footer" className="bg-gray-900 text-white pt-12 pb-6" role="contentinfo">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="mb-6 md:mb-0">
            <Link to="/" className="inline-flex items-center mb-4 space-x-2">
              <OptimizedImage 
                src="/images/logo.avif" 
                alt="Proense Seguros" 
                className="h-8" 
                loading="lazy"
              />
              <span className="text-white text-2xl font-bold">Proense Seguros</span>
            </Link>
            <p className="text-gray-300 mb-4">
              Más de 25 años de experiencia en el mercado de seguros en Colombia,
              ofreciendo soluciones personalizadas para proteger lo que más valoras.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/proense" target="_blank" rel="noopener noreferrer" className="text-white hover:text-primary">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="https://www.instagram.com/proense_seguros/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-primary">
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="https://api.whatsapp.com/send?phone=573155862884&text=Hola%2C%20me%20gustar%C3%ADa%20agendar%20una%20cita%20para%20recibir%20asesor%C3%ADa%20de%20Proense%20Seguros%20%F0%9F%98%83" target="_blank" rel="noopener noreferrer" className="text-white hover:text-primary">
                <span className="sr-only">WhatsApp</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.498 14.382v-.002c-.301-.15-1.767-.867-2.04-.966-.274-.101-.473-.15-.673.15-.197.295-.771.963-.944 1.16-.174.196-.349.223-.644.075-.3-.15-1.263-.465-2.404-1.485-.888-.794-1.484-1.76-1.66-2.06-.172-.29-.018-.448.13-.594.136-.135.3-.345.451-.523.146-.18.194-.3.29-.494.1-.21.049-.375-.025-.523-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.516-.173-.009-.371-.01-.57-.01-.2 0-.523.074-.797.36-.273.3-1.046 1.02-1.046 2.475s1.07 2.865 1.219 3.075c.149.195 2.1 3.195 5.1 4.485.71.3 1.263.48 1.694.615.713.226 1.36.195 1.871.118.57-.09 1.76-.721 2.002-1.426.248-.705.248-1.29.173-1.425-.074-.135-.27-.21-.57-.354m-5.447 7.443h-.016c-1.77 0-3.524-.48-5.055-1.38l-.36-.214-3.75.975 1.005-3.645-.239-.375a9.878 9.878 0 01-1.52-5.26c.001-5.445 4.493-9.885 10-9.885 2.654 0 5.14 1.035 7.021 2.91 1.88 1.859 2.925 4.35 2.92 6.99-.004 5.444-4.494 9.885-10.011 9.885M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.334.101 11.893c-.002 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652c1.746.943 3.71 1.444 5.71 1.447h.006c6.585 0 11.946-5.336 11.949-11.896 0-3.176-1.24-6.165-3.495-8.411"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Productos */}
          <div className="mb-6 md:mb-0">
            <h3 className="text-xl font-bold mb-4">Seguros</h3>
            <ul className="space-y-2">
              <li><Link to="/seguros/vida" className="text-gray-300 hover:text-primary">Vida</Link></li>
              <li><Link to="/seguros/salud" className="text-gray-300 hover:text-primary">Salud</Link></li>
              <li><Link to="/seguros/auto" className="text-gray-300 hover:text-primary">Auto</Link></li>
              <li><Link to="/seguros/hogar" className="text-gray-300 hover:text-primary">Hogar</Link></li>
              <li><Link to="/seguros/pymes" className="text-gray-300 hover:text-primary">PYMES</Link></li>
              <li><Link to="/seguros/mascotas" className="text-gray-300 hover:text-primary">Mascotas</Link></li>
            </ul>
          </div>

          {/* Enlaces Rápidos */}
          <div className="mb-6 md:mb-0">
            <h3 className="text-xl font-bold mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li><Link to="/blog" className="text-gray-300 hover:text-primary">Blog</Link></li>
              <li><Link to="/nosotros" className="text-gray-300 hover:text-primary">Nosotros</Link></li>
              <li><Link to="/contacto" className="text-gray-300 hover:text-primary">Contacto</Link></li>
              <li><Link to="/politica-de-privacidad" className="text-gray-300 hover:text-primary">Política de Privacidad</Link></li>
              <li><Link to="/terminos-y-condiciones" className="text-gray-300 hover:text-primary">Términos y Condiciones</Link></li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-xl font-bold mb-4">Contáctanos</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <Home className="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span className="text-gray-300">Colombia 🇨🇴</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-primary mr-2" />
                <a href="tel:+573155862884" className="text-gray-300 hover:text-primary">
                  +57 315 586 2884
                </a>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-primary mr-2" />
                <a href="mailto:comercial@proense.co" className="text-gray-300 hover:text-primary">
                  comercial@proense.co
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6">
          <p className="text-sm text-gray-400 text-center">
            © {new Date().getFullYear()} Proense Seguros. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
