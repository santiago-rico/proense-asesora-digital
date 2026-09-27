import type { Locator } from '@playwright/test';
import { blogPost } from '../../fixtures/blog-data';
import { test, expect } from '../../fixtures/network';
import { Site } from '../../fixtures/page-objects/site';

/** The navbar marks the current section with these classes; there is no `aria-current`. */
const ACTIVE = /(^|\s)text-primary(\s|$)/;
const SCROLL_SHADOW = /(^|\s)shadow-md(\s|$)/;

const SEGUROS_ITEMS = [
  { title: 'Vida', path: '/seguros/vida' },
  { title: 'Vida Deudores', path: '/seguros/vida-deudores' },
  { title: 'Salud', path: '/seguros/salud' },
  { title: 'Auto', path: '/seguros/auto' },
  { title: 'Hogar', path: '/seguros/hogar' },
  { title: 'PYMES', path: '/seguros/pymes' },
  { title: 'Mascotas', path: '/seguros/mascotas' },
  { title: 'Motos', path: '/seguros/motos' },
  { title: 'Arrendamiento', path: '/seguros/arrendamiento' },
  { title: 'Viaje', path: '/seguros/viaje' },
];

const CLIENTES_ITEMS = [
  { name: 'Cotización de Seguros', path: '/clientes/cotizacion' },
  { name: 'Emisión de Pólizas', path: '/clientes/emision-polizas' },
  { name: 'Modificaciones', path: '/clientes/modificaciones' },
  { name: 'Cancelaciones', path: '/clientes/cancelaciones' },
  { name: 'Siniestros y Emergencias', path: '/clientes/siniestros' },
  { name: 'Pagos', path: '/clientes/pagos' },
];

type NavItem = 'Inicio' | 'Seguros' | 'Clientes' | 'Nosotros' | 'Blog' | 'Contacto';
const NAV_ITEMS: NavItem[] = ['Inicio', 'Seguros', 'Clientes', 'Nosotros', 'Blog', 'Contacto'];

/** A page and the heading that proves it rendered (/blog has no h1). */
interface Destination {
  path: string;
  heading: string;
  level?: 1 | 2;
}

const heading = (site: Site, { heading: name, level = 1 }: Destination) =>
  site.page.getByRole('heading', { level, name, exact: true });

/**
 * A "Seguros" dropdown item. Its accessible name is title + description
 * ("Vida Protege a tus…"), and "Vida" also prefixes "Vida Deudores", so match
 * the title's own text exactly.
 */
function segurosItem(site: Site, title: string): Locator {
  return site.nav.getByRole('link').filter({ has: site.page.getByText(title, { exact: true }) });
}

/** The links of the open dropdown whose list contains `has` (a locator relative to that list). */
function dropdownLinks(site: Site, has: Locator): Locator {
  return site.nav.getByRole('list').filter({ has }).getByRole('link');
}

test.describe('Navbar de escritorio', () => {
  test.skip(({ isMobile }) => isMobile, 'La barra de escritorio solo se muestra desde el breakpoint md');

  test('el menú "Seguros" lista los 10 seguros y cada uno enlaza a su página', async ({ page }) => {
    const site = new Site(page);
    await site.goto('/');
    await site.openNavMenu('Seguros');

    await expect(dropdownLinks(site, page.getByText('Hogar', { exact: true }))).toHaveCount(SEGUROS_ITEMS.length);
    for (const { title, path } of SEGUROS_ITEMS) {
      await expect(segurosItem(site, title)).toHaveAttribute('href', path);
    }

    // Dropdown items are plain <a href>: a full page load, not SPA navigation.
    await segurosItem(site, 'Vida Deudores').click();
    await expect(page).toHaveURL('/seguros/vida-deudores');
    await expect(site.h1).toHaveText('Seguro de Vida Deudores');
  });

  test('el menú "Clientes" lista los 6 servicios y cada uno enlaza a su página', async ({ page }) => {
    const site = new Site(page);
    await site.goto('/');
    await site.openNavMenu('Clientes');

    const clientesItem = (name: string) => site.nav.getByRole('link', { name, exact: true });
    const pagos = page.getByRole('link', { name: 'Pagos', exact: true });
    await expect(dropdownLinks(site, pagos)).toHaveCount(CLIENTES_ITEMS.length);
    for (const { name, path } of CLIENTES_ITEMS) {
      await expect(clientesItem(name)).toHaveAttribute('href', path);
    }

    await clientesItem('Siniestros y Emergencias').click();
    await expect(page).toHaveURL('/clientes/siniestros');
    await expect(site.h1).toHaveText('¿Qué hacer en caso de un siniestro?');
  });

  test('"Inicio", "Nosotros", "Blog" y "Contacto" navegan dentro de la SPA', async ({ page }) => {
    const site = new Site(page);
    await site.goto('/politica-de-privacidad');
    // A full page load would wipe this marker.
    await page.evaluate(() => Object.assign(window, { spaMarker: true }));

    const links: (Destination & { name: NavItem })[] = [
      { name: 'Nosotros', path: '/nosotros', heading: 'Sobre Nosotros' },
      { name: 'Blog', path: '/blog', heading: 'Últimos Artículos', level: 2 },
      { name: 'Contacto', path: '/contacto', heading: 'Estamos para Servirte' },
      { name: 'Inicio', path: '/', heading: 'Protege lo que más valoras con expertos a tu lado' },
    ];
    for (const link of links) {
      await site.navLink(link.name).click();
      await expect(page).toHaveURL(link.path);
      await expect(heading(site, link)).toBeVisible();
    }
    expect(await page.evaluate(() => 'spaMarker' in window)).toBe(true);
  });

  test.describe('Estado activo', () => {
    test.beforeEach(({ sanity }) => {
      sanity.posts = [blogPost()];
    });

    const cases: { path: string; active: NavItem }[] = [
      { path: '/', active: 'Inicio' },
      { path: '/seguros/auto', active: 'Seguros' },
      { path: '/clientes/pagos', active: 'Clientes' },
      { path: '/nosotros', active: 'Nosotros' },
      { path: '/blog/mi-post', active: 'Blog' },
      { path: '/contacto', active: 'Contacto' },
    ];

    for (const { path, active } of cases) {
      test(`en ${path} solo "${active}" está activo`, async ({ page }) => {
        const site = new Site(page);
        await site.goto(path);
        for (const item of NAV_ITEMS) {
          const control = item === 'Seguros' || item === 'Clientes' ? site.navMenuButton(item) : site.navLink(item);
          if (item === active) await expect(control).toHaveClass(ACTIVE);
          else await expect(control).not.toHaveClass(ACTIVE);
        }
      });
    }
  });

  test('la barra gana sombra al desplazarse más de 10 px', async ({ page }) => {
    const site = new Site(page);
    await site.goto('/');
    await expect(site.nav).not.toHaveClass(SCROLL_SHADOW);

    await page.evaluate(() => window.scrollTo(0, 11));
    await expect(site.nav).toHaveClass(SCROLL_SHADOW);
    await page.evaluate(() => window.scrollTo(0, 10));
    await expect(site.nav).not.toHaveClass(SCROLL_SHADOW);
  });

  test('el botón "Solicitar Asesoría" abre el diálogo', async ({ page }) => {
    const site = new Site(page);
    await site.goto('/');
    await site.navLeadButton.click();
    await expect(site.leadDialog).toBeVisible();
  });
});

test.describe('Menú móvil', () => {
  test.skip(({ isMobile }) => !isMobile, 'El menú hamburguesa solo se muestra en móvil');

  const bodyOverflow = (site: Site) => () => site.page.evaluate(() => getComputedStyle(document.body).overflow);

  test('el botón hamburguesa abre y cierra el menú y bloquea el scroll mientras está abierto', async ({ page }) => {
    const site = new Site(page);
    await site.goto('/');
    await expect(site.hamburger).toHaveAccessibleName('Abrir menú de navegación');
    await expect(site.hamburger).toHaveAttribute('aria-expanded', 'false');
    await expect(site.mobileMenu).toHaveAttribute('aria-hidden', 'true');

    await site.openMobileMenu();
    await expect(site.hamburger).toHaveAccessibleName('Cerrar menú de navegación');
    await expect.poll(bodyOverflow(site)).toBe('hidden');

    await site.hamburger.click();
    await expect(site.hamburger).toHaveAccessibleName('Abrir menú de navegación');
    await expect(site.hamburger).toHaveAttribute('aria-expanded', 'false');
    await expect(site.mobileMenu).toHaveAttribute('aria-hidden', 'true');
    await expect.poll(bodyOverflow(site)).toBe('visible');
  });

  test('los submenús se despliegan y un enlace navega y cierra el menú', async ({ page }) => {
    const site = new Site(page);
    await site.goto('/');
    await site.openMobileMenu();

    for (const name of ['Seguros', 'Clientes'] as const) {
      const toggle = site.mobileSectionToggle(name);
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
      await toggle.click();
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    }
    await site.mobileSectionToggle('Clientes').click();
    await expect(site.mobileSectionToggle('Clientes')).toHaveAttribute('aria-expanded', 'false');

    await site.mobileMenu.getByRole('link', { name: 'Motos', exact: true }).click();
    await expect(page).toHaveURL('/seguros/motos');
    await expect(site.h1).toHaveText('Seguro de Motos');
    await expect(site.hamburger).toHaveAttribute('aria-expanded', 'false');
    await expect(site.mobileMenu).toHaveAttribute('aria-hidden', 'true');
    await expect.poll(bodyOverflow(site)).toBe('visible');
  });

  test('Escape cierra el menú y devuelve el foco al botón hamburguesa', async ({ page }) => {
    const site = new Site(page);
    await site.goto('/');
    await site.openMobileMenu();
    await site.mobileMenu.getByRole('link', { name: 'Inicio', exact: true }).focus();

    await page.keyboard.press('Escape');
    await expect(site.hamburger).toHaveAttribute('aria-expanded', 'false');
    await expect(site.mobileMenu).toHaveAttribute('aria-hidden', 'true');
    await expect(site.hamburger).toBeFocused();
  });

  test('un clic fuera del menú lo cierra', async ({ page }) => {
    const site = new Site(page);
    await site.goto('/');
    await site.openMobileMenu();

    // The open panel covers the top of the viewport: click the page's side gutter near the bottom.
    const { height } = page.viewportSize()!;
    await site.main.click({ position: { x: 4, y: height - 20 } });
    await expect(site.hamburger).toHaveAttribute('aria-expanded', 'false');
    await expect(site.mobileMenu).toHaveAttribute('aria-hidden', 'true');
  });

  test('"Solicitar Asesoría" cierra el menú y abre el diálogo', async ({ page }) => {
    const site = new Site(page);
    await site.goto('/');
    await site.openMobileMenu();

    await site.navLeadButton.click();
    await expect(site.leadDialog).toBeVisible();
    // The dialog hides the page from the accessibility tree; `mobileMenu` still finds the panel.
    await expect(site.mobileMenu).toHaveAttribute('aria-hidden', 'true');
  });
});

test.describe('Diálogo "Solicitar Asesoría"', () => {
  /** Pages and how many "Solicitar Asesoría" buttons their content has (the navbar's aside). */
  const entryPoints = [
    { path: '/', buttons: 2 }, // hero + closing CTA section
    { path: '/nosotros', buttons: 1 },
    { path: '/blog', buttons: 1 },
    { path: '/seguros/vida', buttons: 2 }, // hero + closing CTA section
  ];

  for (const { path, buttons } of entryPoints) {
    test(`en ${path} cada botón "Solicitar Asesoría" abre el diálogo`, async ({ page }) => {
      const site = new Site(page);
      await site.goto(path);
      const ctas = site.main.getByRole('button', { name: 'Solicitar Asesoría', exact: true });
      await expect(ctas).toHaveCount(buttons);

      for (let i = 0; i < buttons; i++) {
        await ctas.nth(i).click();
        await expect(site.leadDialog).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(site.leadDialog).toBeHidden();
      }
    });
  }

  const closers: { how: string; close: (site: Site) => Promise<void> }[] = [
    { how: 'el botón "Close"', close: site => site.leadDialog.getByRole('button', { name: 'Close' }).click() },
    { how: 'Escape', close: site => site.page.keyboard.press('Escape') },
    {
      how: 'un clic en el fondo',
      close: async site => {
        // The overlay has no role. The top-left corner is outside the settled dialog on both
        // viewports, but on mobile the dialog's zoom/slide-in animation briefly covers it.
        await site.leadDialog.evaluate(el => Promise.all(el.getAnimations().map(a => a.finished)).then(() => {}));
        await site.page.mouse.click(4, 4);
      },
    },
  ];

  for (const { how, close } of closers) {
    test(`se cierra con ${how}`, async ({ page }) => {
      const site = new Site(page);
      await site.goto('/');
      await site.main.getByRole('button', { name: 'Solicitar Asesoría', exact: true }).first().click();
      await expect(site.leadDialog).toBeVisible();

      await close(site);
      await expect(site.leadDialog).toBeHidden();
    });
  }

  test('al cerrarse devuelve el foco al botón que lo abrió', async ({ page }) => {
    test.fail(
      true,
      'Known bug: focus falls to <body> on close. The dialog is opened from App state with no Radix DialogTrigger, so onCloseAutoFocus has no trigger to focus, src/components/forms/LeadGenerationDialog.tsx:14-15.',
    );
    const site = new Site(page);
    await site.goto('/');
    const cta = site.main.getByRole('button', { name: 'Solicitar Asesoría', exact: true }).first();
    await cta.click();
    await expect(site.leadDialog).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(site.leadDialog).toBeHidden();
    await expect(cta).toBeFocused();
  });

  test('el enlace "Política de Privacidad" activado con el teclado cierra el diálogo y muestra la política', async ({
    page,
  }) => {
    const site = new Site(page);
    await site.goto('/');
    await site.main.getByRole('button', { name: 'Solicitar Asesoría', exact: true }).first().click();

    await site.leadDialog.getByRole('link', { name: 'Política de Privacidad' }).focus();
    await page.keyboard.press('Enter');
    await expect(site.leadDialog).toBeHidden();
    await expect(page).toHaveURL('/politica-de-privacidad');
    await expect(site.h1).toHaveText('Política de Privacidad');
  });

  test('un clic en "Política de Privacidad" cierra el diálogo y muestra la política', async ({ page }) => {
    test.fail(
      true,
      'Known bug: the first click on the link is lost. Its mousedown blurs the auto-focused, empty name field; onBlur validation inserts "El nombre es requerido" above the link, which moves before mouseup, src/components/forms/LeadForm.tsx:69 (mode "onBlur"), as in bug #1.',
    );
    const site = new Site(page);
    await site.goto('/');
    await site.main.getByRole('button', { name: 'Solicitar Asesoría', exact: true }).first().click();

    await site.leadDialog.getByRole('link', { name: 'Política de Privacidad' }).click();
    await expect(site.leadDialog).toBeHidden();
    await expect(page).toHaveURL('/politica-de-privacidad');
    await expect(site.h1).toHaveText('Política de Privacidad');
  });
});

test.describe('Footer', () => {
  test('cada enlace interno lleva a su página', async ({ page }) => {
    const links: (Destination & { name: string })[] = [
      { name: 'Vida', path: '/seguros/vida', heading: 'Seguro de Vida' },
      { name: 'Salud', path: '/seguros/salud', heading: 'Seguro de Salud' },
      { name: 'Auto', path: '/seguros/auto', heading: 'Seguro de Auto' },
      { name: 'Hogar', path: '/seguros/hogar', heading: 'Seguro de Hogar' },
      { name: 'PYMES', path: '/seguros/pymes', heading: 'Seguro para PYMES' },
      { name: 'Mascotas', path: '/seguros/mascotas', heading: 'Seguro de Mascotas' },
      { name: 'Blog', path: '/blog', heading: 'Últimos Artículos', level: 2 },
      { name: 'Nosotros', path: '/nosotros', heading: 'Sobre Nosotros' },
      { name: 'Contacto', path: '/contacto', heading: 'Estamos para Servirte' },
      { name: 'Política de Privacidad', path: '/politica-de-privacidad', heading: 'Política de Privacidad' },
      { name: 'Términos y Condiciones', path: '/terminos-y-condiciones', heading: 'Términos y Condiciones' },
    ];
    const site = new Site(page);
    await site.goto('/');

    for (const link of links) {
      await site.footer.getByRole('link', { name: link.name, exact: true }).click();
      await expect(page).toHaveURL(link.path);
      await expect(heading(site, link)).toBeVisible();
    }
  });

  test('redes sociales, teléfono, correo y copyright del año actual', async ({ page }) => {
    const site = new Site(page);
    await site.goto('/');

    const social: { name: string; href: string | RegExp }[] = [
      { name: 'Facebook', href: 'https://www.facebook.com/proense' },
      { name: 'Instagram', href: 'https://www.instagram.com/proense_seguros/' },
      { name: 'WhatsApp', href: /^https:\/\/api\.whatsapp\.com\/send\?phone=573155862884&text=/ },
    ];
    for (const { name, href } of social) {
      const link = site.footer.getByRole('link', { name, exact: true });
      await expect(link).toHaveAttribute('href', href);
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
    await expect(site.footer.getByRole('link', { name: '+57 315 586 2884' })).toHaveAttribute('href', 'tel:+573155862884');
    await expect(site.footer.getByRole('link', { name: 'comercial@proense.co' })).toHaveAttribute(
      'href',
      'mailto:comercial@proense.co',
    );
    await expect(site.footer.getByText('Todos los derechos reservados')).toContainText(
      `© ${new Date().getFullYear()} Proense Seguros`,
    );
  });
});

test.describe('Página 404', () => {
  test('las rutas inexistentes muestran el 404', async ({ page }) => {
    const site = new Site(page);
    // /seguros/empresarial is where blog posts about PYMES link to (known bug #11).
    for (const path of ['/no-existe', '/seguros', '/clientes', '/seguros/decesos', '/seguros/empresarial']) {
      await page.goto(path);
      await expect(site.h1, path).toHaveText('404');
    }
  });

  test('"Return to Home" vuelve al inicio', async ({ page }) => {
    const site = new Site(page);
    await page.goto('/no-existe');
    await page.getByRole('link', { name: 'Return to Home' }).click();
    await expect(page).toHaveURL('/');
    await expect(site.h1).toHaveText('Protege lo que más valoras con expertos a tu lado');
  });

  test('la página 404 está en español y dentro del Layout, con navbar y footer', async ({ page }) => {
    test.fail(
      true,
      'Known bug: NotFound renders outside Layout (no navbar/footer) with English copy "Oops! Page not found" / "Return to Home", src/pages/NotFound.tsx:14-23.',
    );
    const site = new Site(page);
    await page.goto('/no-existe');
    await expect(site.h1).toHaveText('404');
    await expect(site.nav).toBeVisible();
    await expect(site.footer).toBeVisible();
    await expect(page.getByText('Oops! Page not found')).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Return to Home' })).toHaveCount(0);
  });
});
