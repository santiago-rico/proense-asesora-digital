
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import LeadGenerationDialog from "@/components/forms/LeadGenerationDialog";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showLeadDialog, setShowLeadDialog] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setScrolled(offset > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleOpenLeadDialog = () => {
    setShowLeadDialog(true);
  };

  const insuranceProducts = [
    { name: "Vida", href: "/seguros/vida", description: "Protege a tus seres queridos y garantiza su futuro financiero." },
    { name: "Salud", href: "/seguros/salud", description: "Accede a la mejor atención médica privada para ti y tu familia." },
    { name: "Auto", href: "/seguros/auto", description: "Cobertura completa para tu vehículo ante cualquier eventualidad." },
    { name: "Hogar", href: "/seguros/hogar", description: "Protege tu hogar y tus pertenencias contra daños y robos." },
    { name: "PYMES", href: "/seguros/pymes", description: "Soluciones personalizadas para proteger tu negocio." },
    { name: "Mascotas", href: "/seguros/mascotas", description: "Cuidado veterinario y protección para tu compañero peludo." },
    { name: "Motos", href: "/seguros/motos", description: "Coberturas específicas para tu motocicleta y tu seguridad." },
    { name: "Arrendamiento", href: "/seguros/arrendamiento", description: "Garantiza el pago de tu arriendo y protege tu propiedad." },
    { name: "Viaje", href: "/seguros/viaje", description: "Viaja tranquilo con una cobertura internacional completa." },
  ];

  const clientServices = [
    { name: "Emisión de Pólizas", href: "/servicios/emision-polizas" },
    { name: "Modificaciones", href: "/servicios/modificaciones" },
    { name: "Cancelaciones", href: "/servicios/cancelaciones" },
    { name: "Información de Siniestros", href: "/servicios/siniestros" },
  ];

  // Reordered navbar items as requested
  const navLinks = [
    { name: "Inicio", href: "/" },
    { name: "Seguros", href: "/seguros", dropdown: true },
    { name: "Servicios", href: "/servicios", dropdown: true },
    { name: "Nosotros", href: "/nosotros" },
    { name: "Blog", href: "/blog" },
    { name: "Contacto", href: "/contacto" },
  ];

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      <nav
        className={`fixed w-full z-50 transition-all duration-300 ${
          scrolled ? "bg-white shadow-md py-2" : "bg-white/95 py-4"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-primary">Proense <span className="text-accent">Seguros</span></span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              <NavigationMenu>
                <NavigationMenuList>
                  {/* Display standard nav links first */}
                  {navLinks.filter(link => !link.dropdown).map((link) => (
                    <NavigationMenuItem key={link.name}>
                      <NavigationMenuLink asChild className={cn(
                        navigationMenuTriggerStyle(),
                        isActive(link.href) ? "text-primary font-medium" : "text-gray-700"
                      )}>
                        <Link to={link.href}>{link.name}</Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  ))}
                  
                  {/* Insurance Dropdown */}
                  <NavigationMenuItem>
                    <NavigationMenuTrigger 
                      className={cn(
                        "bg-background",
                        isActive("/seguros") ? "bg-primary/20 text-primary font-medium" : "text-gray-700"
                      )}
                    >
                      Seguros
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                        {insuranceProducts.map((product) => (
                          <li key={product.name}>
                            <NavigationMenuLink asChild>
                              <Link
                                to={product.href}
                                className={cn(
                                  "block select-none space-y-1 rounded-md p-3 hover:bg-accent hover:text-accent-foreground",
                                  isActive(product.href) ? "bg-secondary text-primary font-medium" : ""
                                )}
                              >
                                <div className="text-sm font-medium">{product.name}</div>
                                <p className="text-xs line-clamp-2 text-muted-foreground">
                                  {product.description}
                                </p>
                              </Link>
                            </NavigationMenuLink>
                          </li>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  {/* Client Services Dropdown */}
                  <NavigationMenuItem>
                    <NavigationMenuTrigger 
                      className={cn(
                        "bg-background",
                        isActive("/servicios") ? "bg-primary/20 text-primary font-medium" : "text-gray-700"
                      )}
                    >
                      Servicios
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[400px] gap-3 p-4">
                        {clientServices.map((service) => (
                          <li key={service.name}>
                            <NavigationMenuLink asChild>
                              <Link
                                to={service.href}
                                className={cn(
                                  "block select-none rounded-md p-3 hover:bg-accent hover:text-accent-foreground",
                                  isActive(service.href) ? "bg-secondary text-primary font-medium" : ""
                                )}
                              >
                                <div className="text-sm font-medium">{service.name}</div>
                              </Link>
                            </NavigationMenuLink>
                          </li>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
              
              <Button className="ml-4" size="sm" variant="secondary" onClick={handleOpenLeadDialog}>
                <Phone size={16} className="mr-2" />
                Asesoría Gratuita
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-700 focus:outline-none"
                aria-label="Toggle menu"
              >
                {isOpen ? (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation - Updated to match the new order */}
          {isOpen && (
            <div className="md:hidden mt-4 animate-fade-in">
              <ul className="flex flex-col space-y-2 pb-4">
                <li>
                  <Link
                    to="/"
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors hover:text-primary ${
                      isActive("/") ? "text-primary" : "text-gray-700"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    Inicio
                  </Link>
                </li>
                <li>
                  <div className="px-3 py-2 font-medium text-gray-700">Seguros</div>
                  <ul className="pl-6 space-y-2">
                    {insuranceProducts.map((product) => (
                      <li key={product.name}>
                        <Link
                          to={product.href}
                          className="block px-3 py-1 text-sm text-gray-600 hover:text-primary"
                          onClick={() => setIsOpen(false)}
                        >
                          {product.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
                <li>
                  <div className="px-3 py-2 font-medium text-gray-700">Servicios</div>
                  <ul className="pl-6 space-y-2">
                    {clientServices.map((service) => (
                      <li key={service.name}>
                        <Link
                          to={service.href}
                          className="block px-3 py-1 text-sm text-gray-600 hover:text-primary"
                          onClick={() => setIsOpen(false)}
                        >
                          {service.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
                <li>
                  <Link
                    to="/nosotros"
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors hover:text-primary ${
                      isActive("/nosotros") ? "text-primary" : "text-gray-700"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    Nosotros
                  </Link>
                </li>
                <li>
                  <Link
                    to="/blog"
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors hover:text-primary ${
                      isActive("/blog") ? "text-primary" : "text-gray-700"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contacto"
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors hover:text-primary ${
                      isActive("/contacto") ? "text-primary" : "text-gray-700"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    Contacto
                  </Link>
                </li>
                <li>
                  <Button className="w-full mt-2" size="sm" onClick={() => {
                    setIsOpen(false);
                    handleOpenLeadDialog();
                  }}>
                    <Phone size={16} className="mr-2" />
                    Asesoría Gratuita
                  </Button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </nav>
      
      <LeadGenerationDialog open={showLeadDialog} onOpenChange={setShowLeadDialog} />
    </>
  );
};

export default Navbar;
