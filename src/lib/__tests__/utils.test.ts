import { CheckCircle, ShieldCheck } from 'lucide-react';
import { insuranceProductsData } from '@/data/insuranceProductsData';
import { getIcon } from '../utils';

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
    // A name missing from the map renders the default icon instead.
    const unmapped = [...names].filter((name) => getIcon(name) === CheckCircle).sort();
    expect(unmapped).toEqual([]);
  });
});
