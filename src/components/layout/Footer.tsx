
import React from "react";
import { Link } from "react-router-dom";
import { Phone, Mail, Home } from "lucide-react";
import OptimizedImage from "@/components/shared/OptimizedImage";
import { FacebookIcon, InstagramIcon, WhatsAppIcon } from "@/components/shared/SocialIcons";

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
                <FacebookIcon className="h-6 w-6" />
              </a>
              <a href="https://www.instagram.com/proense_seguros/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-primary">
                <span className="sr-only">Instagram</span>
                <InstagramIcon className="h-6 w-6" />
              </a>
              <a href="https://api.whatsapp.com/send?phone=573155862884&text=Hola%2C%20me%20gustar%C3%ADa%20agendar%20una%20cita%20para%20recibir%20asesor%C3%ADa%20de%20Proense%20Seguros%20%F0%9F%98%83" target="_blank" rel="noopener noreferrer" className="text-white hover:text-primary">
                <span className="sr-only">WhatsApp</span>
                <WhatsAppIcon className="h-6 w-6" />
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
