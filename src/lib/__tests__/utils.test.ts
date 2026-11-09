import { CheckCircle, ShieldCheck } from 'lucide-react';
import { insuranceProductsData } from '@/data/insuranceProductsData';
import { getIcon } from '../utils';

// Known bug: these names are not Lucide icons (in 0.x or 1.x), so the
// coverages that use them ("Muerte Accidental", "Responsabilidad Civil
// Extracontractual", "Robo o Extravío") show the default icon. Pick real
// icons in the product data, then empty this list.
const KNOWN_MISSING_ICONS = ['CarCrash', 'SearchHeart'];

describe('getIcon', () => {
  it('returns null without a name', () => {
    expect(getIcon(undefined)).toBeNull();
    expect(getIcon('')).toBeNull();
  });

  it('returns the named icon', () => {
    expect(getIcon('ShieldCheck')).toBe(ShieldCheck);
  });

  it('falls back to the default icon for unknown names', () => {
    expect(getIcon('NotAnIcon')).toBe(CheckCircle);
    expect(getIcon('constructor')).toBe(CheckCircle);
  });

  it('has an icon for every coverage icon name in the product data', () => {
    const names = new Set(
      Object.values(insuranceProductsData).flatMap((product) =>
        product.coverages.flatMap((coverage) => (coverage.icon ? [coverage.icon] : [])),
      ),
    );
    const unmapped = [...names].filter((name) => getIcon(name) === CheckCircle).sort();
    expect(unmapped).toEqual(KNOWN_MISSING_ICONS);
  });
});
