import { expect, it } from 'vitest';
import { initialInventory, recordMovement } from './inventory';

// Conventional regression: the expectation remains correct while the source defect is present.
it('selling 2 kg sugar from 15 kg leaves 13 kg', () => {
  const next = recordMovement(initialInventory(), 'sugar', 'sale', 2);
  expect(next.products.find(product => product.id === 'sugar')?.stock).toBe(13000);
});
