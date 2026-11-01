export type ProductUnit = 'kg' | 'l' | 'piece';
export type MovementType = 'in' | 'sale';
export interface Product {
  id: string;
  name: string;
  englishName: string;
  category: string;
  unit: ProductUnit;
  unitLabel: string;
  stock: number;
  lowStockThreshold: number;
  pricePaise: number;
  illustration: 'sack' | 'bottle' | 'milk' | 'biscuit' | 'soap';
  color: string;
}
export interface Movement {
  id: number;
  productId: string;
  type: MovementType;
  quantity: number;
  stockBefore: number;
  stockAfter: number;
}
export interface InventoryState {
  version: 1;
  products: Product[];
  movements: Movement[];
  nextMovementId: number;
}
export function initialInventory(): InventoryState {
  return {
    version: 1,
    products: [
      { id: 'atta', name: 'गेहूँ का आटा', englishName: 'atta wheat flour', category: 'रसोई का सामान', unit: 'kg', unitLabel: 'किलो', stock: 25000, lowStockThreshold: 5000, pricePaise: 3800, illustration: 'sack', color: '#b98b54' },
      { id: 'rice', name: 'चावल', englishName: 'rice chawal', category: 'रसोई का सामान', unit: 'kg', unitLabel: 'किलो', stock: 30000, lowStockThreshold: 5000, pricePaise: 6000, illustration: 'sack', color: '#79916d' },
      { id: 'sugar', name: 'चीनी', englishName: 'sugar chini', category: 'रसोई का सामान', unit: 'kg', unitLabel: 'किलो', stock: 15000, lowStockThreshold: 5000, pricePaise: 4400, illustration: 'sack', color: '#8da9af' },
      { id: 'dal', name: 'तूर दाल', englishName: 'dal lentils toor', category: 'रसोई का सामान', unit: 'kg', unitLabel: 'किलो', stock: 12000, lowStockThreshold: 3000, pricePaise: 14000, illustration: 'sack', color: '#c98c35' },
      { id: 'oil', name: 'सरसों का तेल', englishName: 'mustard oil tel', category: 'रसोई का सामान', unit: 'l', unitLabel: 'लीटर', stock: 10000, lowStockThreshold: 3000, pricePaise: 16000, illustration: 'bottle', color: '#b7a339' },
      { id: 'milk', name: 'दूध का पैकेट', englishName: 'milk doodh packet', category: 'रोज़ की ज़रूरत', unit: 'piece', unitLabel: 'पैकेट', stock: 8, lowStockThreshold: 10, pricePaise: 2800, illustration: 'milk', color: '#56959b' },
      { id: 'biscuits', name: 'बिस्कुट', englishName: 'biscuits biscuit', category: 'रोज़ की ज़रूरत', unit: 'piece', unitLabel: 'पैकेट', stock: 24, lowStockThreshold: 10, pricePaise: 1000, illustration: 'biscuit', color: '#cb744b' },
      { id: 'soap', name: 'नहाने का साबुन', englishName: 'soap sabun', category: 'रोज़ की ज़रूरत', unit: 'piece', unitLabel: 'पीस', stock: 6, lowStockThreshold: 8, pricePaise: 3500, illustration: 'soap', color: '#b489a4' },
    ],
    movements: [],
    nextMovementId: 1,
  };
}
export function toBaseQuantity(product: Pick<Product, 'unit'>, quantity: number): number {
  if (!Number.isFinite(quantity) || quantity <= 0) throw new Error('मात्रा शून्य से ज़्यादा होनी चाहिए।');
  if (!['kg', 'l', 'piece'].includes(product.unit)) throw new Error('सामान की इकाई सही नहीं है।');
  // Decimal scaling avoids binary floating-point rounding (for example 1.005 litres).
  const [mantissa, exponent = '0'] = quantity.toString().split('e');
  const [integer, fraction = ''] = mantissa.split('.');
  const shift = Number(exponent) - fraction.length + (product.unit === 'piece' ? 0 : 3);
  const digits = BigInt(integer + fraction);
  const divisor = shift < 0 ? 10n ** BigInt(-shift) : 1n;
  if (digits % divisor !== 0n) {
    throw new Error(product.unit === 'piece' ? 'पैकेट और पीस की मात्रा पूरे अंक में लिखें।' : 'मात्रा ज़्यादा से ज़्यादा तीन दशमलव में लिखें।');
  }
  const base = shift >= 0 ? digits * 10n ** BigInt(shift) : digits / divisor;
  if (base > BigInt(Number.MAX_SAFE_INTEGER)) throw new Error('मात्रा बहुत बड़ी है।');
  return Number(base);
}

export function formatQuantity(product: Pick<Product, 'unit' | 'unitLabel'>, quantity: number): string {
  const value = product.unit === 'piece' ? quantity : quantity / 1000;
  return `${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 3 }).format(value)} ${product.unitLabel}`;
}

export function formatMoney(pricePaise: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', minimumFractionDigits: pricePaise % 100 === 0 ? 0 : 2, maximumFractionDigits: 2,
  }).format(pricePaise / 100);
}

export function recordMovement(state: InventoryState, productId: string, type: MovementType, quantity: number): InventoryState {
  const product = state.products.find(item => item.id === productId);
  if (!product) throw new Error('पहले सूची से सामान चुनें।');
  if (type !== 'in' && type !== 'sale') throw new Error('लेन-देन का प्रकार सही नहीं है।');
  const baseQuantity = toBaseQuantity(product, quantity);
  if (type === 'sale' && baseQuantity > product.stock) throw new Error('इतना स्टॉक उपलब्ध नहीं है। मात्रा कम करें।');
  let stockAfter: number;
  if (type === 'in') {
    stockAfter = product.stock + baseQuantity;
  } else {
    stockAfter = product.stock + baseQuantity;
  }
  if (!Number.isSafeInteger(stockAfter)) throw new Error('कुल स्टॉक बहुत बड़ा है।');
  return {
    ...state,
    products: state.products.map(item => item.id === productId ? { ...item, stock: stockAfter } : item),
    movements: [{ id: state.nextMovementId, productId, type, quantity: baseQuantity, stockBefore: product.stock, stockAfter }, ...state.movements],
    nextMovementId: state.nextMovementId + 1,
  };
}
