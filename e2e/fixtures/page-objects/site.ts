import { expect, type Locator, type Page } from '@playwright/test';

/** Every route shares this document title (`index.html`; there is no per-route head manager). */
export const SITE_TITLE = 'Proense | Asesores en Seguros en Colombia';

/**
 * The site chrome from `Layout`: navbar (desktop + mobile menu), main landmark,
 * footer, the global "Solicitar Asesoría" dialog and toasts.
 */
export class Site {
  constructor(readonly page: Page) {}

  async goto(path: string): Promise<void> {
    await this.page.goto(path);
    await expect(this.page.getByRole('heading', { level: 1 }).or(this.page.getByRole('heading', { level: 2 })).first()).toBeVisible();
  }

  get nav(): Locator {
    return this.page.getByRole('navigation', { name: 'Navegación principal' });
  }

  /** Layout's `<main id="main-content">`. */
  get main(): Locator {
    return this.page.getByRole('main');
  }

  get footer(): Locator {
    return this.page.getByRole('contentinfo');
  }

  get h1(): Locator {
    return this.page.getByRole('heading', { level: 1 });
  }

  // --- Desktop navbar -------------------------------------------------------

  /** A top-level desktop nav link: "Inicio", "Nosotros", "Blog", "Contacto". */
  navLink(name: string): Locator {
    return this.nav.getByRole('link', { name, exact: true });
  }

  /** The desktop "Seguros" / "Clientes" dropdown triggers. */
  navMenuButton(name: 'Seguros' | 'Clientes'): Locator {
    return this.nav.getByRole('button', { name, exact: true });
  }

  /** Opens a desktop dropdown by clicking its trigger (don't also hover: hover + click closes it). */
  async openNavMenu(name: 'Seguros' | 'Clientes'): Promise<void> {
    const trigger = this.navMenuButton(name);
    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  }

  /** The "Solicitar Asesoría" button in the navbar (desktop bar, or inside the open mobile menu). */
  get navLeadButton(): Locator {
    return this.nav.getByRole('button', { name: 'Solicitar Asesoría' });
  }

  // --- Mobile menu ----------------------------------------------------------

  /** Hamburger button; its name toggles between "Abrir…" and "Cerrar menú de navegación". */
  get hamburger(): Locator {
    return this.nav.getByRole('button', { name: /(Abrir|Cerrar) menú de navegación/ });
  }

  /**
   * The mobile menu panel. It is collapsed with `max-h-0 opacity-0`, which
   * Playwright still counts as visible: assert `aria-hidden`/`aria-expanded`,
   * not `toBeHidden()`.
   */
  get mobileMenu(): Locator {
    return this.page.getByRole('menu', { name: 'Menú de navegación móvil', includeHidden: true });
  }

  async openMobileMenu(): Promise<void> {
    await this.hamburger.click();
    await expect(this.hamburger).toHaveAttribute('aria-expanded', 'true');
    await expect(this.mobileMenu).toHaveAttribute('aria-hidden', 'false');
  }

  /** The "Seguros" / "Clientes" section toggles inside the open mobile menu. */
  mobileSectionToggle(name: 'Seguros' | 'Clientes'): Locator {
    return this.mobileMenu.getByRole('button', { name, exact: true });
  }

  // --- Dialog and toasts ----------------------------------------------------

  /**
   * The global lead dialog. While it is open Radix hides everything else from
   * the accessibility tree, so scope locators to it.
   */
  get leadDialog(): Locator {
    return this.page.getByRole('dialog', { name: 'Solicitar Asesoría' });
  }

  /** Toasts render their title as plain text; only one is shown at a time and it closes after ~5 s. */
  toast(text: string | RegExp): Locator {
    return this.page.locator('li[data-state="open"]').filter({ hasText: text });
  }
}
