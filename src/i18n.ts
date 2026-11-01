import { formatQuantity } from './inventory';
import type { MovementType, Product } from './inventory';

export type Language = 'hi' | 'en';
export const LANGUAGE_KEY = 'kirana-saathi.language.v1';

export const copy = {
  hi: {
    title: 'किराना साथी · दुकान का अपना साथी', description: 'किराना साथी — रोज़ का स्टॉक और हिसाब, एक जगह।',
    brand: 'किराना साथी', brandLabel: 'किराना साथी मुख्य पृष्ठ', tagline: 'दुकान का अपना साथी', language: 'भाषा',
    sampleShop: 'नमूना दुकान', help: 'ऐप सहायता', eyebrow: 'रोज़ का हिसाब, सुकून के साथ', heading: 'मेरी दुकान का स्टॉक',
    intro: 'सामान जोड़ें, बिक्री लिखें और स्टॉक पर नज़र रखें।', shopNote: 'अपनी दुकान। अपना हिसाब।', shopNoteDetail: 'छोटी शुरुआत, आसान रोज़मर्रा।',
    summary: 'दुकान का सार', totalProducts: 'कुल सामान', productKinds: 'तरह के सामान', lowStock: 'कम स्टॉक', reorder: 'फिर से मँगाएँ', stockValue: 'स्टॉक की कुल कीमत',
    productList: 'सामान की सूची', stockViews: 'स्टॉक के पृष्ठ', allProducts: 'सभी सामान', transactions: 'लेन-देन', search: 'सामान खोजें', searchPlaceholder: 'सामान खोजें, जैसे चीनी…',
    listLayout: 'सूची का रूप', grid: 'कार्ड में देखें', table: 'तालिका में देखें', lowNote: 'इन सामानों का स्टॉक कम है। नया माल जोड़कर भरपाई करें।',
    ledger: 'स्टॉक का लेन-देन', newestFirst: 'सबसे नया पहले', noTransactions: 'अभी कोई लेन-देन नहीं', noTransactionsDetail: 'पहला माल या बिक्री दर्ज करें। पूरा हिसाब यहाँ दिखेगा।',
    product: 'सामान', quantity: 'मात्रा', before: 'पहले', after: 'अब', received: 'माल आया', sold: 'बिक्री हुई', noProducts: 'सामान नहीं मिला',
    noProductsDetail: 'दूसरा नाम लिखें या सभी सामान देखें।', showAll: 'सभी सामान देखें', available: 'उपलब्ध', stockTable: 'सामान का स्टॉक', price: 'कीमत', stock: 'स्टॉक', status: 'स्थिति', select: 'चुनें',
    chooseHint: 'सामान चुनें और हिसाब लिखें', recordStock: 'स्टॉक लिखें', formDetail: 'एक छोटा कदम, हिसाब पूरा।', currentlyAvailable: 'अभी उपलब्ध',
    piecePlaceholder: 'जैसे 2', decimalPlaceholder: 'जैसे 2 या 0.5', pieceHint: 'पैकेट या पीस पूरे अंक में लिखें।', saleAmount: 'बिक्री की कीमत', receiptAmount: 'माल की कीमत',
    addStock: 'माल जोड़ें', recordSale: 'बिक्री दर्ज करें', reminder: 'छोटी सी याद', receiptTip: 'दुकान में नया माल आए तो यहाँ जोड़ें। स्टॉक और लेन-देन दोनों अपडेट होंगे।',
    saleTip: 'जो सामान बिका है, उसकी मात्रा लिखें। हर बिक्री का हिसाब लेन-देन में मिलेगा।', stored: 'हिसाब इस ब्राउज़र में सुरक्षित है', notStored: 'इस बार हिसाब सहेजा नहीं जा सका',
    reset: 'नमूना फिर से शुरू करें', resetTitle: 'नमूना फिर से शुरू करें?', resetDescription: 'अभी का स्टॉक और लेन-देन हट जाएगा। दुकान के आठ नमूना सामान वापस आ जाएँगे।',
    cancelReset: 'रहने दें', confirmReset: 'फिर से शुरू करें', resetSuccess: 'नमूना दुकान फिर से शुरू हो गई।', unknownError: 'मात्रा जाँचकर फिर से लिखें।',
  },
  en: {
    title: 'Kirana Saathi · Your shop companion', description: 'Kirana Saathi — daily stock and accounts in one place.',
    brand: 'Kirana Saathi', brandLabel: 'Kirana Saathi home', tagline: 'Your shop companion', language: 'Language',
    sampleShop: 'Sample shop', help: 'App help', eyebrow: 'Daily accounts, with peace of mind', heading: 'My shop inventory',
    intro: 'Add stock, record sales and keep track of your inventory.', shopNote: 'Your shop. Your accounts.', shopNoteDetail: 'Small beginnings, simpler days.',
    summary: 'Shop summary', totalProducts: 'Total products', productKinds: 'types of products', lowStock: 'Low stock', reorder: 'Time to restock', stockValue: 'Total stock value',
    productList: 'Product list', stockViews: 'Inventory views', allProducts: 'All products', transactions: 'Transactions', search: 'Search products', searchPlaceholder: 'Search products, e.g. sugar…',
    listLayout: 'List layout', grid: 'View as cards', table: 'View as table', lowNote: 'These products are running low. Add new stock to refill them.',
    ledger: 'Stock transactions', newestFirst: 'Newest first', noTransactions: 'No transactions yet', noTransactionsDetail: 'Record your first receipt or sale. Your full account will appear here.',
    product: 'Product', quantity: 'Quantity', before: 'Before', after: 'Now', received: 'Stock received', sold: 'Sold', noProducts: 'No products found',
    noProductsDetail: 'Try another name or view all products.', showAll: 'View all products', available: 'Available', stockTable: 'Product stock', price: 'Price', stock: 'Stock', status: 'Status', select: 'Select',
    chooseHint: 'Choose a product and record its stock', recordStock: 'Record stock', formDetail: 'One small step, complete accounts.', currentlyAvailable: 'Available now',
    piecePlaceholder: 'e.g. 2', decimalPlaceholder: 'e.g. 2 or 0.5', pieceHint: 'Enter packets or pieces as whole numbers.', saleAmount: 'Sale value', receiptAmount: 'Stock value',
    addStock: 'Add stock', recordSale: 'Record sale', reminder: 'A small reminder', receiptTip: 'Add new goods here when they arrive. Stock and transactions will both be updated.',
    saleTip: 'Enter the quantity sold. Every sale will appear in your transactions.', stored: 'Your inventory is saved in this browser', notStored: 'Your inventory could not be saved this time',
    reset: 'Reset sample shop', resetTitle: 'Reset sample shop?', resetDescription: 'Current stock and transactions will be removed. The eight sample products will be restored.',
    cancelReset: 'Keep my stock', confirmReset: 'Reset shop', resetSuccess: 'The sample shop has been reset.', unknownError: 'Check the quantity and try again.',
  },
} satisfies Record<Language, Record<string, string>>;

function isLanguage(value: string | null): value is Language { return value === 'hi' || value === 'en'; }

export function loadLanguage(): Language {
  const query = new URLSearchParams(window.location.search).get('lang');
  if (isLanguage(query)) return query;
  try {
    const saved = window.localStorage.getItem(LANGUAGE_KEY);
    return isLanguage(saved) ? saved : 'hi';
  } catch { return 'hi'; }
}

export function applyLanguage(language: Language) {
  try { window.localStorage.setItem(LANGUAGE_KEY, language); } catch { /* Browser storage is optional. */ }
  document.documentElement.lang = language;
  document.title = copy[language].title;
  document.querySelector('meta[name="description"]')?.setAttribute('content', copy[language].description);
  const url = new URL(window.location.href);
  if (isLanguage(url.searchParams.get('lang')) && url.searchParams.get('lang') !== language) {
    url.searchParams.set('lang', language);
    window.history.replaceState(window.history.state, '', url);
  }
}

const englishNames: Record<string, string> = { atta: 'Wheat flour', rice: 'Rice', sugar: 'Sugar', dal: 'Toor dal', oil: 'Mustard oil', milk: 'Milk packet', biscuits: 'Biscuits', soap: 'Bath soap' };
export function productName(product: Product, language: Language): string { return language === 'hi' ? product.name : englishNames[product.id] || product.englishName; }
export function productCategory(product: Product, language: Language): string {
  return language === 'hi' ? product.category : product.category === 'रसोई का सामान' ? 'Kitchen essentials' : 'Daily essentials';
}
export function unitLabel(product: Product, language: Language, quantity = 1): string {
  if (language === 'hi') return product.unitLabel;
  if (product.unit === 'kg') return 'kg';
  const unit = product.unit === 'l' ? 'litre' : product.unitLabel === 'पैकेट' ? 'packet' : 'piece';
  return quantity === 1 ? unit : `${unit}s`;
}
export function localizedQuantity(product: Product, quantity: number, language: Language): string {
  return formatQuantity({ ...product, unitLabel: unitLabel(product, language, product.unit === 'piece' ? quantity : quantity / 1000) }, quantity);
}
export function chooseLabel(product: Product, language: Language): string {
  const name = productName(product, language);
  return language === 'hi' ? `${name} चुनें` : `Select ${name}`;
}
export function lowStockLabel(count: number, language: Language): string { return language === 'hi' ? `कम स्टॉक देखें, ${count} सामान` : `View low stock, ${count} products`; }
export function productsShown(count: number, language: Language): string { return language === 'hi' ? `${count} सामान दिख रहे हैं` : `${count} ${count === 1 ? 'product' : 'products'} shown`; }
export function decimalHint(product: Product, language: Language): string { return language === 'hi' ? `आधा ${product.unitLabel} हो तो 0.5 लिखें।` : `For half a ${product.unit === 'kg' ? 'kilogram' : 'litre'}, enter 0.5.`; }
export function movementMessage(product: Product, type: MovementType, language: Language): string {
  const name = productName(product, language);
  return language === 'hi' ? `${name} का ${type === 'in' ? 'माल जोड़ दिया गया' : 'बिक्री दर्ज हो गई'}।` : type === 'in' ? `Stock added for ${name}.` : `Sale recorded for ${name}.`;
}

// Translate at the UI boundary so the canonical inventory rules and their errors stay unchanged.
const englishErrors: Record<string, string> = {
  'मात्रा शून्य से ज़्यादा होनी चाहिए।': 'Quantity must be greater than zero.',
  'सामान की इकाई सही नहीं है।': 'The product unit is invalid.',
  'पैकेट और पीस की मात्रा पूरे अंक में लिखें।': 'Enter packet and piece quantities as whole numbers.',
  'मात्रा ज़्यादा से ज़्यादा तीन दशमलव में लिखें।': 'Enter a quantity with no more than three decimal places.',
  'मात्रा बहुत बड़ी है।': 'The quantity is too large.',
  'पहले सूची से सामान चुनें।': 'Choose a product from the list first.',
  'लेन-देन का प्रकार सही नहीं है।': 'The transaction type is invalid.',
  'इतना स्टॉक उपलब्ध नहीं है। मात्रा कम करें।': 'Not enough stock is available. Reduce the quantity.',
  'कुल स्टॉक बहुत बड़ा है।': 'The total stock is too large.',
};
export function localizeInventoryError(error: string, language: Language): string {
  return language === 'hi' ? error : englishErrors[error] || copy.en.unknownError;
}
export function localizedHelpUrl(supportUrl: string, language: Language): string {
  const url = new URL(supportUrl, window.location.href);
  url.searchParams.set('lang', language);
  return url.href;
}
