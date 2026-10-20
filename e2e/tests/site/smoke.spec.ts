import { blogPost } from '../../fixtures/blog-data';
import { test, expect } from '../../fixtures/network';
import { Site, SITE_TITLE } from '../../fixtures/page-objects/site';

/** Every route in `src/App.tsx` with its exact h1. The auto fixture fails the test on page/console errors. */
const ROUTES: { path: string; h1: string }[] = [
  { path: '/', h1: 'Protege lo que más valoras con expertos a tu lado' },
  { path: '/contacto', h1: 'Estamos para Servirte' },
  { path: '/nosotros', h1: 'Sobre Nosotros' },
  { path: '/blog', h1: 'Blog' },
  { path: '/blog/mi-post', h1: 'Mi post' },
  { path: '/seguros/vida', h1: 'Seguro de Vida' },
  { path: '/seguros/vida-deudores', h1: 'Seguro de Vida Deudores' },
  { path: '/seguros/salud', h1: 'Seguro de Salud' },
  { path: '/seguros/auto', h1: 'Seguro de Auto' },
  { path: '/seguros/hogar', h1: 'Seguro de Hogar' },
  { path: '/seguros/pymes', h1: 'Seguro para PYMES' },
  { path: '/seguros/mascotas', h1: 'Seguro de Mascotas' },
  { path: '/seguros/motos', h1: 'Seguro de Motos' },
  { path: '/seguros/arrendamiento', h1: 'Seguro de Arrendamiento' },
  { path: '/seguros/viaje', h1: 'Seguro de Viaje' },
  { path: '/clientes/cotizacion', h1: 'Cotización de Seguros' },
  { path: '/clientes/emision-polizas', h1: 'Emisión de Pólizas' },
  { path: '/clientes/modificaciones', h1: 'Modificaciones de Pólizas' },
  { path: '/clientes/cancelaciones', h1: 'Cancelación de Pólizas' },
  { path: '/clientes/siniestros', h1: '¿Qué hacer en caso de un siniestro?' },
  { path: '/clientes/pagos', h1: 'Paga tu seguro en un solo clic' },
  { path: '/politica-de-privacidad', h1: 'Política de Privacidad' },
  { path: '/terminos-y-condiciones', h1: 'Términos y Condiciones' },
];

test.describe('Smoke: todas las rutas', () => {
  test.beforeEach(({ sanity }) => {
    sanity.posts = [blogPost()];
  });

  for (const { path, h1 } of ROUTES) {
    test(`${path} carga con su h1, navbar y footer`, async ({ page }) => {
      const site = new Site(page);
      await page.goto(path);
      await expect(site.h1).toHaveText(h1);
      await expect(page).toHaveTitle(SITE_TITLE);
      await expect(site.nav).toBeVisible();
      await expect(site.footer).toBeVisible();
    });
  }

  test('una ruta inexistente muestra el 404 con navbar y footer', async ({ page }) => {
    const site = new Site(page);
    await page.goto('/no-existe');
    await expect(site.h1).toHaveText('Página no encontrada');
    await expect(page).toHaveTitle(SITE_TITLE);
    await expect(site.nav).toBeVisible();
    await expect(site.footer).toBeVisible();
  });
});
