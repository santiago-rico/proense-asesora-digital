import { describe, it, expect } from 'vitest';
import { insuranceProductsData } from '@/data/insuranceProductsData';
import {
  PRODUCT_BLOG_CATEGORIES,
  getCategoryBlogPath,
  getCategoryProductPath,
  getCategorySlug,
} from './blogCategories';

describe('PRODUCT_BLOG_CATEGORIES', () => {
  it('only uses product types that have a product page', () => {
    for (const type of Object.keys(PRODUCT_BLOG_CATEGORIES)) {
      expect(insuranceProductsData, type).toHaveProperty([type]);
    }
  });
});

describe('getCategoryProductPath', () => {
  it.each([
    ['Seguro de Vida', '/seguros/vida'],
    ['Seguro de Auto', '/seguros/auto'],
    ['Seguros para PYMES', '/seguros/pymes'],
    ['Seguro de Arrendamiento', '/seguros/arrendamiento'],
    ['Seguro para Mascotas', '/seguros/mascotas'],
  ])('"%s" links to %s', (category, path) => {
    expect(getCategoryProductPath(category)).toBe(path);
  });

  it('round-trips every product type except vida-deudores, which shares "Seguro de Vida"', () => {
    for (const [type, category] of Object.entries(PRODUCT_BLOG_CATEGORIES)) {
      expect(getCategoryProductPath(category)).toBe(type === 'vida-deudores' ? '/seguros/vida' : `/seguros/${type}`);
    }
  });

  it('returns undefined for a category without a product page', () => {
    expect(getCategoryProductPath('Noticias')).toBeUndefined();
  });
});

describe('getCategorySlug', () => {
  it.each([
    ['Seguro de Vida', 'seguro-de-vida'],
    ['Seguros para PYMES', 'seguros-para-pymes'],
    ['Pólizas de Construcción', 'polizas-de-construccion'],
    ['  ARL / Riesgos laborales ', 'arl-riesgos-laborales'],
    ['seguro-de-auto', 'seguro-de-auto'],
  ])('"%s" → "%s"', (category, slug) => {
    expect(getCategorySlug(category)).toBe(slug);
  });

  it('builds the filtered blog list path', () => {
    expect(getCategoryBlogPath('Seguro de Hogar')).toBe('/blog?category=seguro-de-hogar');
  });
});
