import { useState, useEffect, useRef, forwardRef, ComponentPropsWithoutRef } from "react";
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
} from "@/components/ui/navigation-menu";
import { navigationMenuTriggerStyle } from "@/lib/navigation-menu-styles";
import { cn } from "@/lib/utils";
import OptimizedImage from "@/components/shared/OptimizedImage";

interface NavbarProps {
  handleOpenLeadDialog: () => void;
}

function Navbar({ handleOpenLeadDialog }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setScrolled(offset > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle outside click to close mobile menu
  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (
        isOpen &&
        mobileMenuRef.current &&
        hamburgerRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        !hamburgerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Handle escape key to close mobile menu
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        // Return focus to hamburger button when closing with escape
        hamburgerRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen]);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const insuranceProducts = [
    { name: "Vida", href: "/seguros/vida", description: "Protege a tus seres queridos y garantiza su futuro financiero." },
    { name: "Vida Deudores", href: "/seguros/vida-deudores", description: "Protección que cubre tus deudas en caso de fallecimiento o incapacidad." },
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
    { name: "Emisión de Pólizas", href: "/clientes/emision-polizas" },
    { name: "Modificaciones", href: "/clientes/modificaciones" },
    { name: "Cancelaciones", href: "/clientes/cancelaciones" },
    { name: "Siniestros y Emergencias", href: "/clientes/siniestros" },
    { name: "Pagos", href: "/clientes/pagos" },
  ];

  const navLinks = [
    { name: "Inicio", href: "/" },
    { name: "Seguros", href: "/seguros", dropdown: true },
    { name: "Clientes", href: "/clientes", dropdown: true },
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
        id="main-navigation"
        role="navigation"
        aria-label="Navegación principal"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${scrolled ? "bg-white shadow-md py-2" : "bg-white py-2"
          }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center">
              <OptimizedImage
                src="/images/logo.avif"
                alt="Proense Seguros Logo"
                className="h-12 w-auto"
                loading="eager"
              />
              <OptimizedImage
                src="/images/text-logo.avif"
                alt="Proense Seguros Text"
                className="h-8 w-auto ml-2"
                loading="eager"
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              <NavigationMenu>
                <NavigationMenuList>
                  {/* Inicio Link */}
                  <NavigationMenuItem key="inicio">
                    <NavigationMenuLink asChild className={cn(
                      navigationMenuTriggerStyle(),
                      "text-base", // Increased font size
                      isActive("/") ? "text-primary font-medium" : "text-gray-700"
                    )}>
                      <Link to="/">Inicio</Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>

                  {/* Seguros Dropdown */}
                  <NavigationMenuItem key="seguros">
                    <NavigationMenuTrigger className={cn(
                      "text-base", // Increased font size
                      isActive("/seguros") ? "text-primary font-medium" : "text-gray-700"
                    )}>Seguros</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                        {insuranceProducts.map((product) => (
                          <ListItem
                            key={product.name}
                            title={product.name}
                            href={product.href}
                          >
                            {product.description}
                          </ListItem>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  {/* Clientes Dropdown */}
                  <NavigationMenuItem key="clientes">
                    <NavigationMenuTrigger className={cn(
                      "text-base", // Increased font size
                      isActive("/clientes") ? "text-primary font-medium" : "text-gray-700"
                    )}>Clientes</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[300px] gap-3 p-4 md:w-[400px] ">
                        {clientServices.map((service) => (
                          <ListItem
                            key={service.name}
                            title={service.name}
                            href={service.href}
                          />
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  {/* Nosotros Link */}
                  <NavigationMenuItem key="nosotros">
                    <NavigationMenuLink asChild className={cn(
                      navigationMenuTriggerStyle(),
                      "text-base", // Increased font size
                      isActive("/nosotros") ? "text-primary font-medium" : "text-gray-700"
                    )}>
                      <Link to="/nosotros">Nosotros</Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>

                  {/* Blog Link */}
                  <NavigationMenuItem key="blog">
                    <NavigationMenuLink asChild className={cn(
                      navigationMenuTriggerStyle(),
                      "text-base", // Increased font size
                      isActive("/blog") ? "text-primary font-medium" : "text-gray-700"
                    )}>
                      <Link to="/blog">Blog</Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>

                  <NavigationMenuItem key="contacto">
                    <NavigationMenuLink asChild className={cn(
                      navigationMenuTriggerStyle(),
                      "text-base", // Increased font size
                      isActive("/contacto") ? "text-primary font-medium" : "text-gray-700"
                    )}>
                      <Link to="/contacto">Contacto</Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>

              <Button className="ml-4" size="default" variant="secondary" onClick={handleOpenLeadDialog}>
                <Phone size={16} className="mr-2" />
                Solicitar Asesoría Gratuita
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                ref={hamburgerRef}
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-700 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md transition-colors duration-200"
                style={{ minWidth: '44px', minHeight: '44px', padding: '10px' }}
                aria-label={isOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación"}
                aria-expanded={isOpen}
                aria-controls="mobile-navigation-menu"
                type="button"
              >
                <div className="flex items-center justify-center w-6 h-6">
                  {isOpen ? (
                    <svg className="h-6 w-6 transform transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="h-6 w-6 transform transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div
            ref={mobileMenuRef}
            id="mobile-navigation-menu"
            className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out bg-white border-t border-gray-100 shadow-sm ${isOpen
              ? 'max-h-screen opacity-100 mt-4'
              : 'max-h-0 opacity-0'
              }`}
            role="menu"
            aria-label="Menú de navegación móvil"
            aria-hidden={!isOpen}
          >
            <ul className="flex flex-col space-y-1 pb-4" role="none">
              {navLinks.map((link) => {
                if (link.dropdown) {
                  const items = link.href === "/seguros" ? insuranceProducts : clientServices;
                  return (
                    <li key={link.name}>
                      <div className="px-4 py-3 font-medium text-gray-800 border-b border-gray-100">{link.name}</div>
                      <ul className="bg-gray-50 space-y-1">
                        {items.map((item) => (
                          <li key={item.name}>
                            <Link
                              to={item.href}
                              className="block px-6 py-3 text-sm text-gray-600 hover:text-primary hover:bg-gray-100 transition-colors duration-200 active:bg-gray-200"
                              style={{ minHeight: '44px' }}
                              onClick={() => setIsOpen(false)}
                            >
                              {item.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </li>
                  );
                }

                return (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className={`block px-4 py-3 rounded-md text-base font-medium transition-colors duration-200 hover:text-primary hover:bg-gray-50 active:bg-gray-100 ${isActive(link.href) ? "text-primary bg-blue-50" : "text-gray-700"
                        }`}
                      style={{ minHeight: '44px' }}
                      onClick={() => setIsOpen(false)}
                    >
                      {link.name}
                    </Link>
                  </li>
                );
              })}
              <li className="pt-2 border-t border-gray-200 mt-2">
                <Button
                  className="w-full"
                  size="default"
                  style={{ minHeight: '44px' }}
                  onClick={() => {
                    setIsOpen(false);
                    handleOpenLeadDialog();
                  }}
                >
                  <Phone size={18} className="mr-2" />
                  Solicitar Asesoría Gratuita
                </Button>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
}

const ListItem = forwardRef<
  React.ElementRef<"a">,
  ComponentPropsWithoutRef<"a"> & { title?: string }
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground group",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground group-hover:text-white">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";

export default Navbar;
