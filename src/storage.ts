import { initialInventory } from './inventory';
import type { InventoryState } from './inventory';

export const STORAGE_KEY = 'kirana-saathi.inventory.v1';
const nonnegativeInteger = (value: unknown): value is number => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;

export function deserializeInventory(raw: string | null): InventoryState {
  const seed = initialInventory();
  if (!raw) return seed;
  try {
    const saved = JSON.parse(raw) as InventoryState;
    if (saved.version !== 1 || !Array.isArray(saved.products) || saved.products.length !== 8 || !Array.isArray(saved.movements)) return seed;
    if (!nonnegativeInteger(saved.nextMovementId) || saved.nextMovementId !== saved.movements.length + 1) return seed;
    const products = seed.products.map(product => {
      const matches = saved.products.filter(item => item?.id === product.id);
      const found = matches[0];
      if (matches.length !== 1 || found.unit !== product.unit || found.pricePaise !== product.pricePaise || !nonnegativeInteger(found.stock)) throw new Error('invalid product');
      return { ...product, stock: found.stock };
    });
    const expectedStocks = new Map(products.map(product => [product.id, product.stock]));
    const movements = saved.movements.map((movement, index) => {
      if (!movement || movement.id !== saved.nextMovementId - index - 1 || !expectedStocks.has(movement.productId)) throw new Error('invalid ledger');
      if (movement.type !== 'in' && movement.type !== 'sale') throw new Error('invalid movement type');
      if (!nonnegativeInteger(movement.quantity) || movement.quantity === 0 || !nonnegativeInteger(movement.stockBefore) || !nonnegativeInteger(movement.stockAfter)) throw new Error('invalid quantity');
      if (expectedStocks.get(movement.productId) !== movement.stockAfter) throw new Error('broken ledger chain');
      expectedStocks.set(movement.productId, movement.stockBefore);
      return { id: movement.id, productId: movement.productId, type: movement.type, quantity: movement.quantity, stockBefore: movement.stockBefore, stockAfter: movement.stockAfter };
    });
    if (seed.products.some(product => expectedStocks.get(product.id) !== product.stock)) return seed;
    return { version: 1, products, movements, nextMovementId: saved.nextMovementId };
  } catch { return seed; }
}

export function loadInventory(storage: Pick<Storage, 'getItem'>): InventoryState {
  try { return deserializeInventory(storage.getItem(STORAGE_KEY)); }
  catch { return initialInventory(); }
}

export function saveInventory(state: InventoryState, storage: Pick<Storage, 'setItem'>): boolean {
  try { storage.setItem(STORAGE_KEY, JSON.stringify(state)); return true; }
  catch { return false; }
}
