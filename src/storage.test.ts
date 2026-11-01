import { describe, expect, it } from 'vitest';
import { initialInventory, recordMovement } from './inventory';
import { deserializeInventory, loadInventory, saveInventory, STORAGE_KEY } from './storage';

describe('versioned browser storage', () => {
  // Catches dropping saved transactions or persisting under the wrong key.
  it('restores an actual receipt and ledger after a storage round trip', () => {
    const state = recordMovement(initialInventory(), 'sugar', 'in', 1.25);
    expect(saveInventory(state, localStorage)).toBe(true);
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();
    expect(loadInventory(localStorage).products.find(p => p.id === 'sugar')?.stock).toBe(16250);
    expect(loadInventory(localStorage).movements[0]).toEqual({ id: 1, productId: 'sugar', type: 'in', quantity: 1250, stockBefore: 15000, stockAfter: 16250 });
  });
  // Catches trusting corrupt JSON, unsupported versions, invalid units or unsafe integers.
  it.each([null, '{oops', '{}', '{"version":2,"products":[]}', '{"version":1,"products":null}'])('safely resets unreadable state %s', raw => {
    expect(deserializeInventory(raw).products.find(p => p.id === 'sugar')?.stock).toBe(15000);
  });
  it.each(['negative-stock', 'fractional-stock', 'missing-product', 'invalid-movement', 'wrong-unit', 'unsafe-stock'])('falls back for corrupt %s data', corruption => {
    const state = recordMovement(initialInventory(), 'sugar', 'in', 1);
    if (corruption === 'negative-stock') state.products[0].stock = -1;
    if (corruption === 'fractional-stock') state.products[0].stock = 1.5;
    if (corruption === 'missing-product') state.products.pop();
    if (corruption === 'invalid-movement') state.movements[0].productId = 'missing';
    if (corruption === 'wrong-unit') state.products[0].unit = 'piece';
    if (corruption === 'unsafe-stock') state.products[0].stock = Number.MAX_SAFE_INTEGER + 1;
    expect(deserializeInventory(JSON.stringify(state)).products.find(p => p.id === 'sugar')?.stock).toBe(15000);
    expect(deserializeInventory(JSON.stringify(state)).movements).toEqual([]);
  });
  it('continues with seed data if browser storage is unavailable', () => {
    // Storage can throw in private/blocked contexts; these doubles exercise that boundary only.
    expect(loadInventory({ getItem() { throw new Error('blocked'); } }).products).toHaveLength(8);
    expect(saveInventory(initialInventory(), { setItem() { throw new Error('quota'); } })).toBe(false);
  });
});
