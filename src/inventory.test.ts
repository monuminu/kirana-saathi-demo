import { describe, expect, it } from 'vitest';
import { formatMoney, formatQuantity, initialInventory, recordMovement, toBaseQuantity } from './inventory';

describe('seed inventory', () => {
  // Catches a missing product or shared mutable seed across resets.
  it('starts a fresh eight-product shop with 15 kg sugar and low-stock milk and soap', () => {
    const state = initialInventory();
    expect(state.products).toHaveLength(8);
    expect(state.products.find(p => p.id === 'sugar')?.stock).toBe(15000);
    expect(state.products.filter(p => p.stock <= p.lowStockThreshold).map(p => p.id)).toEqual(['milk', 'soap']);
    state.products[0].stock = 1;
    expect(initialInventory().products[0].stock).toBe(25000);
    expect(state.movements).toEqual([]);
  });
});

describe('unit boundaries', () => {
  // Catches mixed units, rounding a fraction of a gram, and fractional packet sales.
  it.each([
    ['kg', 1.25, 1250], ['kg', 0.001, 1], ['l', 0.275, 275], ['l', 1.005, 1005], ['piece', 3, 3],
  ] as const)('converts %s quantity %s to the exact integer %s', (unit, quantity, want) => {
    expect(toBaseQuantity({ unit }, quantity)).toBe(want);
  });
  it.each([0, -2, NaN, Infinity, 0.0001, Number.MAX_SAFE_INTEGER])('rejects invalid kilogram quantity %s', quantity => {
    expect(() => toBaseQuantity({ unit: 'kg' }, quantity)).toThrow();
  });
  it('rejects fractional packets', () => {
    expect(() => toBaseQuantity({ unit: 'piece' }, 1.5)).toThrow();
  });
  it('shows stored grams and paise in shop units without rounding away precision', () => {
    expect(formatQuantity({ unit: 'kg', unitLabel: 'किलो' }, 1250)).toBe('1.25 किलो');
    expect(formatQuantity({ unit: 'l', unitLabel: 'लीटर' }, 275)).toBe('0.275 लीटर');
    expect(formatMoney(4450)).toBe('₹44.50');
  });
});

describe('movement records', () => {
  // Catches a lost receipt, mutation of prior stock, or an incorrect ledger unit.
  it('receives 1.25 kg sugar and records its before and after stock without mutating prior state', () => {
    const state = initialInventory();
    const next = recordMovement(state, 'sugar', 'in', 1.25);
    expect(next.products.find(p => p.id === 'sugar')?.stock).toBe(16250);
    expect(state.products.find(p => p.id === 'sugar')?.stock).toBe(15000);
    expect(next.movements).toEqual([{ id: 1, productId: 'sugar', type: 'in', quantity: 1250, stockBefore: 15000, stockAfter: 16250 }]);
    expect(next.nextMovementId).toBe(2);
  });
  it('orders receipts newest first with distinct ledger identifiers', () => {
    const next = recordMovement(recordMovement(initialInventory(), 'milk', 'in', 2), 'oil', 'in', 0.5);
    expect(next.movements.map(m => [m.id, m.productId, m.quantity])).toEqual([[2, 'oil', 500], [1, 'milk', 2]]);
    expect(next.products.find(p => p.id === 'milk')?.stock).toBe(10);
  });
  it('rejects a sale larger than the available stock without creating a ledger entry', () => {
    const state = initialInventory();
    expect(() => recordMovement(state, 'sugar', 'sale', 15.001)).toThrow();
    expect(state.movements).toEqual([]);
    expect(state.products.find(p => p.id === 'sugar')?.stock).toBe(15000);
  });
  it('rejects missing products and invalid movement types', () => {
    expect(() => recordMovement(initialInventory(), 'missing', 'in', 1)).toThrow();
    // A JSON/API caller may bypass TypeScript, so runtime validation also matters.
    expect(() => recordMovement(initialInventory(), 'sugar', 'other' as 'in', 1)).toThrow();
  });
  it.each([0, -1, NaN, Infinity])('rejects invalid movement quantity %s', quantity => {
    expect(() => recordMovement(initialInventory(), 'sugar', 'in', quantity)).toThrow();
  });
});
