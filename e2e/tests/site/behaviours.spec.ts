import { test, expect } from '../../fixtures/network';
import { Site } from '../../fixtures/page-objects/site';

test.describe('Comportamientos globales', () => {
  test('el primer Tab enfoca "Saltar al contenido principal" y Enter salta al contenido', async ({ page }) => {
    const site = new Site(page);
    await site.goto('/');

    await page.keyboard.press('Tab');
    const skipLink = page.getByRole('link', { name: 'Saltar al contenido principal' });
    await expect(skipLink).toBeFocused();

    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#main-content$/);
    // The next Tab continues from <main>, past the navbar: the hero CTA is main's first control.
    await page.keyboard.press('Tab');
    await expect(site.main.getByRole('button', { name: 'Solicitar Asesoría', exact: true }).first()).toBeFocused();
  });

  test('al cambiar de ruta la nueva página empieza arriba', async ({ page }) => {
    const site = new Site(page);
    await site.goto('/');
    const scrollY = () => page.evaluate(() => window.scrollY);

    const contacto = site.footer.getByRole('link', { name: 'Contacto', exact: true });
    await contacto.scrollIntoViewIfNeeded();
    expect(await scrollY()).toBeGreaterThan(0);

    await contacto.click();
    await expect(site.h1).toHaveText('Estamos para Servirte');
    // /contacto is taller than the viewport, so without ScrollToTop the browser would keep a non-zero offset.
    expect(await page.evaluate(() => document.documentElement.scrollHeight > window.innerHeight)).toBe(true);
    await expect.poll(scrollY).toBe(0);
  });

  test('una ruta diferida muestra un indicador de carga mientras descarga su página', async ({ page }) => {
    const site = new Site(page);
    let release!: () => void;
    const held = new Promise<void>(resolve => (release = resolve));
    let requested = false;
    // On a direct load the lazy AboutPage module is fetched after the app boots; hold it.
    await page.route('**/src/pages/AboutPage.tsx*', async route => {
      requested = true;
      await held;
      await route.continue();
    });

    await page.goto('/nosotros', { waitUntil: 'commit' });
    await expect.poll(() => requested).toBe(true);
    await expect(page.getByRole('status')).toBeVisible();
    release();
    await expect(site.h1).toHaveText('Sobre Nosotros');
    await expect(page.getByRole('status')).toBeHidden();
  });
});
