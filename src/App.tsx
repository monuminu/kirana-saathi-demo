import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { formatMoney, formatQuantity, initialInventory, recordMovement, toBaseQuantity } from './inventory';
import type { MovementType, Product } from './inventory';
import { loadInventory, saveInventory } from './storage';
import './styles.css';

type View = 'all' | 'low' | 'ledger';

function Icon({ name, size = 20 }: { name: 'bag' | 'search' | 'grid' | 'list' | 'arrow' | 'in' | 'sale' | 'help' | 'check' | 'refresh' | 'leaf' | 'alert'; size?: number }) {
  const paths = {
    bag: <><path d="M5 8h14l1 13H4L5 8Z" /><path d="M8 8V6a4 4 0 0 1 8 0v2" /><path d="m9 14 2 2 4-4" /></>,
    search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></>,
    grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    list: <><path d="M9 5h12M9 12h12M9 19h12" /><path d="M3 5h1M3 12h1M3 19h1" /></>,
    arrow: <><path d="M4 12h15m-5-5 5 5-5 5" /></>,
    in: <><path d="M12 3v13m-5-5 5 5 5-5M4 17v4h16v-4" /></>,
    sale: <><path d="M12 18V5m-5 5 5-5 5 5M4 17v4h16v-4" /></>,
    help: <><circle cx="12" cy="12" r="9" /><path d="M9 9a3 3 0 0 1 6 0c0 2-3 2-3 4m0 3h.01" /></>,
    check: <path d="m5 12 4 4 10-10" />,
    refresh: <><path d="M20 7v5h-5M4 17v-5h5" /><path d="M6 7a7 7 0 0 1 11-2l3 3M4 16l3 3a7 7 0 0 0 11-2" /></>,
    leaf: <><path d="M20 3C8 3 3 8 6 15c7 4 14-1 14-12Z" /><path d="M4 21 15 10" /></>,
    alert: <><path d="m12 3 10 18H2L12 3Z" /><path d="M12 9v5m0 3h.01" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function ProductArt({ product }: { product: Product }) {
  const { illustration, color } = product;
  return <svg className="product-art" viewBox="0 0 150 120" aria-hidden="true">
    <ellipse cx="75" cy="105" rx="39" ry="6" fill="#283d2e" opacity=".08" />
    {illustration === 'sack' && <>
      <path d="m55 22 7 15c-18 15-27 53-14 63 11 8 44 8 55-1 12-11 0-49-17-62l8-15Z" fill="#f1dfbe" stroke="#a78455" strokeWidth="1.5" />
      <path d="M55 22c8 6 29 6 39 0M62 37c8 3 16 3 24 0" fill="none" stroke="#a78455" strokeWidth="2" />
      <path d="M48 57c16-9 38-9 53 0v33c-16 9-38 9-53 0Z" fill={color} />
      <path d="M66 85V65m0 9-7-5m7 0 7-6m-7 18 8-7" stroke="#fff9e9" strokeWidth="2" fill="none" />
      <path d="m82 68 5 5-5 5-5-5Z" fill="#fff9e9" opacity=".8" />
      <path d="M54 47c-4 10-7 20-8 29M95 91c2-9 0-21-2-27" stroke="#fff" opacity=".4" strokeWidth="2" fill="none" />
    </>}
    {illustration === 'bottle' && <>
      <rect x="62" y="15" width="26" height="14" rx="3" fill="#5b6430" />
      <path d="M65 29v12c0 6-18 10-18 20v36c0 8 56 8 56 0V61c0-10-18-14-18-20V29Z" fill="#e6ce57" stroke="#a9942e" strokeWidth="1.5" />
      <path d="M48 65h54v24H48Z" fill="#44734c" /><path d="m72 72 5 4-5 4m10-8 5 4-5 4" stroke="#f7e4a8" strokeWidth="2" fill="none" />
      <path d="M55 58v35" stroke="#fff5bc" strokeWidth="5" strokeLinecap="round" opacity=".6" />
    </>}
    {illustration === 'milk' && <>
      <path d="m47 35 13-15h29l15 15v65H47Z" fill="#f3f4e8" stroke="#66999a" strokeWidth="1.5" /><path d="M60 20v15h44M47 35h57" stroke="#66999a" strokeWidth="1.5" fill="none" />
      <path d="M47 52h57v40H47Z" fill={color} /><path d="M55 68c11 9 24-11 41-2v18H55Z" fill="#c7e2df" /><path d="m72 44 4-5 4 5" stroke="#66999a" fill="none" />
      <circle cx="76" cy="64" r="6" fill="#f7fbeb" />
    </>}
    {illustration === 'biscuit' && <>
      <path d="m37 44 75-9 3 54-75 9Z" fill={color} stroke="#aa5d37" strokeWidth="1.5" /><path d="m40 44 3 53m65-61 3 54" stroke="#f6c4a4" strokeWidth="3" />
      <rect x="55" y="52" width="41" height="29" rx="5" transform="rotate(-7 75 67)" fill="#fae5b2" />
      <circle cx="76" cy="66" r="11" fill="#d9ac64" stroke="#b38342" strokeWidth="1.5" /><path d="M71 62h.1M81 62h.1M71 70h.1M81 70h.1M76 66h.1" stroke="#956a38" strokeWidth="3" strokeLinecap="round" />
    </>}
    {illustration === 'soap' && <>
      <path d="m41 48 60-6 12 13-60 7Z" fill="#d8bfcf" stroke="#ab839c" strokeWidth="1.5" /><path d="m41 48 12 14v34L41 83Z" fill="#9c748e" /><path d="m53 62 60-7v33l-60 8Z" fill={color} />
      <path d="M75 83c-8-7-5-15 11-18 4 11 2 17-11 18Z" fill="#eadfcc" /><path d="m70 86 14-16" stroke="#789175" strokeWidth="1.5" />
      <circle cx="103" cy="25" r="5" stroke="#d1b2c4" strokeWidth="2" fill="none" /><circle cx="114" cy="38" r="3" fill="#d1b2c4" />
    </>}
  </svg>;
}

export default function App() {
  const [inventory, setInventory] = useState(() => { try { return loadInventory(window.localStorage); } catch { return initialInventory(); } });
  const [view, setView] = useState<View>('all');
  const [layout, setLayout] = useState<'grid' | 'table'>('grid');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState('sugar');
  const [type, setType] = useState<MovementType>('in');
  const [quantity, setQuantity] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [stored, setStored] = useState(true);
  const [resetOpen, setResetOpen] = useState(false);
  const cancelReset = useRef<HTMLButtonElement>(null);
  const resetTrigger = useRef<HTMLButtonElement>(null);
  const quantityInput = useRef<HTMLInputElement>(null);
  const selected = inventory.products.find(product => product.id === selectedId)!;
  const lowCount = inventory.products.filter(product => product.stock <= product.lowStockThreshold).length;
  const stockValue = inventory.products.reduce((total, product) => total + product.pricePaise * product.stock / (product.unit === 'piece' ? 1 : 1000), 0);
  const search = query.trim().toLocaleLowerCase();
  const products = inventory.products.filter(product => (view !== 'low' || product.stock <= product.lowStockThreshold) && `${product.name} ${product.englishName}`.toLocaleLowerCase().includes(search));
  const supportUrl = import.meta.env.VITE_SUPPORT_URL || 'http://127.0.0.1:4300';

  useEffect(() => { try { setStored(saveInventory(inventory, window.localStorage)); } catch { setStored(false); } }, [inventory]);
  useEffect(() => { if (resetOpen) cancelReset.current?.focus(); }, [resetOpen]);

  function choose(product: Product) { setSelectedId(product.id); setQuantity(''); setError(''); setMessage(''); }
  function submit(event: FormEvent) {
    event.preventDefault();
    setError(''); setMessage('');
    try {
      const next = recordMovement(inventory, selectedId, type, Number(quantity));
      setInventory(next);
      setMessage(`${selected.name} का ${type === 'in' ? 'माल जोड़ दिया गया' : 'बिक्री दर्ज हो गई'}।`);
      setQuantity('');
      quantityInput.current?.focus();
    } catch (issue) { setError(issue instanceof Error ? issue.message : 'मात्रा जाँचकर फिर से लिखें।'); }
  }
  function closeReset() { setResetOpen(false); resetTrigger.current?.focus(); }
  function reset() { setInventory(initialInventory()); setSelectedId('sugar'); setQuery(''); setView('all'); setQuantity(''); setError(''); setMessage('नमूना दुकान फिर से शुरू हो गई।'); closeReset(); }

  let amount = 0;
  try { amount = toBaseQuantity(selected, Number(quantity)) * selected.pricePaise / (selected.unit === 'piece' ? 1 : 1000); } catch { /* Empty or incomplete input has no estimate. */ }

  return <>
    <header className="app-header">
      <a className="brand" href="#main" aria-label="किराना साथी मुख्य पृष्ठ"><span className="brand-icon"><Icon name="bag" size={28} /></span><span><strong>किराना साथी<span className="brand-dot">.</span></strong><small>दुकान का अपना साथी</small></span></a>
      <div className="header-right"><span className="demo-chip"><span />नमूना दुकान</span><a className="help-link" href={supportUrl} target="_blank" rel="noopener noreferrer"><Icon name="help" />ऐप सहायता</a></div>
    </header>
    <main id="main" className="page-shell">
      <section className="page-heading"><div><span className="eyebrow"><Icon name="leaf" size={15} />रोज़ का हिसाब, सुकून के साथ</span><h1>मेरी दुकान का स्टॉक</h1><p>सामान जोड़ें, बिक्री लिखें और स्टॉक पर नज़र रखें।</p></div><div className="shop-note"><span>अपनी दुकान। अपना हिसाब।</span><small>छोटी शुरुआत, आसान रोज़मर्रा।</small><svg viewBox="0 0 90 55" aria-hidden="true"><path d="M8 52C30 46 34 16 70 8m-33 26c-18 1-18-14-18-14 15-1 19 6 18 14Zm20-15c-5-15 11-19 11-19 7 15-2 23-11 19Z" fill="none" stroke="currentColor" strokeWidth="2" /></svg></div></section>
      <section className="summary-grid" aria-label="दुकान का सार">
        <div className="summary-card"><span className="metric-icon green"><Icon name="bag" size={23} /></span><div><span>कुल सामान</span><strong>{inventory.products.length}<small>तरह के सामान</small></strong></div></div>
        <button className="summary-card" onClick={() => setView('low')} aria-label={`कम स्टॉक देखें, ${lowCount} सामान`}><span className="metric-icon saffron"><Icon name="alert" size={23} /></span><div><span>कम स्टॉक</span><strong>{lowCount}<small>फिर से मँगाएँ</small></strong></div><Icon name="arrow" /></button>
        <div className="summary-card"><span className="metric-icon pale"><span className="rupee-icon">₹</span></span><div><span>स्टॉक की कुल कीमत</span><strong>{formatMoney(Math.round(stockValue))}</strong></div></div>
      </section>
      <div className="workspace">
        <section className="inventory-panel" aria-label="सामान की सूची">
          <div className="panel-top"><nav className="view-tabs" aria-label="स्टॉक के पृष्ठ"><button className={view === 'all' ? 'active' : ''} onClick={() => setView('all')} aria-pressed={view === 'all'}>सभी सामान <span>{inventory.products.length}</span></button><button className={view === 'low' ? 'active' : ''} onClick={() => setView('low')} aria-pressed={view === 'low'}>कम स्टॉक <span>{lowCount}</span></button><button className={view === 'ledger' ? 'active' : ''} onClick={() => setView('ledger')} aria-pressed={view === 'ledger'}>लेन-देन <span>{inventory.movements.length}</span></button></nav></div>
          {view !== 'ledger' && <div className="list-toolbar"><label className="search-field"><Icon name="search" /><input type="search" aria-label="सामान खोजें" placeholder="सामान खोजें, जैसे चीनी…" value={query} onChange={event => setQuery(event.target.value)} /><kbd>⌕</kbd></label><div className="layout-switch" aria-label="सूची का रूप"><button aria-label="कार्ड में देखें" aria-pressed={layout === 'grid'} className={layout === 'grid' ? 'active' : ''} onClick={() => setLayout('grid')}><Icon name="grid" /></button><button aria-label="तालिका में देखें" aria-pressed={layout === 'table'} className={layout === 'table' ? 'active' : ''} onClick={() => setLayout('table')}><Icon name="list" /></button></div></div>}
          {view === 'low' && <div className="low-note"><Icon name="alert" size={17} />इन सामानों का स्टॉक कम है। नया माल जोड़कर भरपाई करें।</div>}
          {view === 'ledger' ? <div className="ledger-body"><div className="section-caption"><h2>स्टॉक का लेन-देन</h2><span>सबसे नया पहले</span></div>{inventory.movements.length === 0 ? <div className="empty-state"><span><Icon name="list" size={30} /></span><h3>अभी कोई लेन-देन नहीं</h3><p>पहला माल या बिक्री दर्ज करें। पूरा हिसाब यहाँ दिखेगा।</p></div> : <div className="table-scroll"><table aria-label="स्टॉक का लेन-देन"><thead><tr><th>सामान</th><th>लेन-देन</th><th>मात्रा</th><th>पहले</th><th>अब</th></tr></thead><tbody>{inventory.movements.map(movement => { const product = inventory.products.find(p => p.id === movement.productId)!; return <tr key={movement.id}><td><small className="ledger-number">#{String(movement.id).padStart(3, '0')}</small><strong>{product.name}</strong></td><td><span className={`movement-chip ${movement.type}`}><Icon name={movement.type} size={14} />{movement.type === 'in' ? 'माल आया' : 'बिक्री हुई'}</span></td><td>{formatQuantity(product, movement.quantity)}</td><td className="muted">{formatQuantity(product, movement.stockBefore)}</td><td><strong>{formatQuantity(product, movement.stockAfter)}</strong></td></tr>; })}</tbody></table></div>}</div>
          : products.length === 0 ? <div className="empty-state"><span><Icon name="search" size={30} /></span><h3>सामान नहीं मिला</h3><p>दूसरा नाम लिखें या सभी सामान देखें।</p><button className="text-button" onClick={() => { setQuery(''); setView('all'); }}>सभी सामान देखें <Icon name="arrow" size={16} /></button></div>
          : layout === 'grid' ? <div className="product-grid">{products.map(product => <button key={product.id} className={`product-card ${selectedId === product.id ? 'selected' : ''}`} aria-label={`${product.name} चुनें`} aria-pressed={selectedId === product.id} onClick={() => choose(product)}><div className="product-top"><span className="category">{product.category}</span>{selectedId === product.id && <span className="selected-check"><Icon name="check" size={13} /></span>}</div><ProductArt product={product} /><div className="product-name">{product.name}</div><div className="product-price">{formatMoney(product.pricePaise)} <span>/ {product.unitLabel}</span></div><div className="product-bottom"><strong>{formatQuantity(product, product.stock)}</strong><span className={`stock-dot ${product.stock <= product.lowStockThreshold ? 'low' : ''}`} /><small>{product.stock <= product.lowStockThreshold ? 'कम स्टॉक' : 'उपलब्ध'}</small></div></button>)}</div>
          : <div className="table-scroll inventory-table"><table aria-label="सामान का स्टॉक"><thead><tr><th>सामान</th><th>कीमत</th><th>स्टॉक</th><th>स्थिति</th><th><span className="sr-only">चुनें</span></th></tr></thead><tbody>{products.map(product => <tr key={product.id} className={selectedId === product.id ? 'selected-row' : ''}><td><strong>{product.name}</strong><small>{product.category}</small></td><td>{formatMoney(product.pricePaise)}<small>/ {product.unitLabel}</small></td><td><strong>{formatQuantity(product, product.stock)}</strong></td><td><span className={`stock-status ${product.stock <= product.lowStockThreshold ? 'low' : ''}`}>{product.stock <= product.lowStockThreshold ? 'कम स्टॉक' : 'उपलब्ध'}</span></td><td><button className="table-choose" aria-label={`${product.name} चुनें`} onClick={() => choose(product)}><Icon name="arrow" size={17} /></button></td></tr>)}</tbody></table></div>}
          {view !== 'ledger' && <div className="list-footer"><span>{products.length} सामान दिख रहे हैं</span><span>सामान चुनें और हिसाब लिखें <Icon name="arrow" size={14} /></span></div>}
        </section>
        <aside className="movement-panel" aria-label="स्टॉक लिखें"><div className="form-heading"><span className="form-mark"><Icon name="in" size={22} /></span><div><h2>स्टॉक लिखें</h2><p>एक छोटा कदम, हिसाब पूरा।</p></div></div><div className="movement-tabs"><button className={type === 'in' ? 'active' : ''} aria-pressed={type === 'in'} onClick={() => { setType('in'); setError(''); setMessage(''); }}><Icon name="in" size={17} />माल आया</button><button className={type === 'sale' ? 'active' : ''} aria-pressed={type === 'sale'} onClick={() => { setType('sale'); setError(''); setMessage(''); }}><Icon name="sale" size={17} />बिक्री हुई</button></div><form onSubmit={submit} noValidate>
          <label className="field-label" htmlFor="product">सामान</label><div className="select-wrap"><select id="product" value={selectedId} onChange={event => choose(inventory.products.find(p => p.id === event.target.value)!)}>{inventory.products.map(product => <option key={product.id} value={product.id}>{product.name}</option>)}</select></div><div className="available-stock"><span>अभी उपलब्ध</span><strong>{formatQuantity(selected, selected.stock)}</strong></div>
          <label className="field-label quantity-label" htmlFor="quantity">मात्रा</label><div className={`quantity-field ${error ? 'has-error' : ''}`}><input ref={quantityInput} id="quantity" type="number" inputMode={selected.unit === 'piece' ? 'numeric' : 'decimal'} min={selected.unit === 'piece' ? '1' : '0.001'} step={selected.unit === 'piece' ? '1' : '0.001'} placeholder={selected.unit === 'piece' ? 'जैसे 2' : 'जैसे 2 या 0.5'} value={quantity} onChange={event => { setQuantity(event.target.value); setError(''); setMessage(''); }} aria-describedby="quantity-hint" aria-invalid={Boolean(error)} /><span>{selected.unitLabel}</span></div><p id="quantity-hint" className="field-hint">{selected.unit === 'piece' ? 'पैकेट या पीस पूरे अंक में लिखें।' : `आधा ${selected.unitLabel} हो तो 0.5 लिखें।`}</p>
          <div className="amount-row"><span>{type === 'sale' ? 'बिक्री की कीमत' : 'माल की कीमत'}</span><strong>{formatMoney(Math.round(amount))}</strong></div><button className="submit-button" type="submit"><Icon name={type} size={19} />{type === 'in' ? 'माल जोड़ें' : 'बिक्री दर्ज करें'}<Icon name="arrow" size={19} /></button>
          {error && <p className="form-error" role="alert"><Icon name="alert" size={17} />{error}</p>}{message && <p className="form-success" role="status"><Icon name="check" size={17} />{message}</p>}
        </form><div className="form-tip"><span>छोटी सी याद</span><p>{type === 'in' ? 'दुकान में नया माल आए तो यहाँ जोड़ें। स्टॉक और लेन-देन दोनों अपडेट होंगे।' : 'जो सामान बिका है, उसकी मात्रा लिखें। हर बिक्री का हिसाब लेन-देन में मिलेगा।'}</p></div></aside>
      </div>
      <footer className="page-footer"><span className={stored ? 'storage-status' : 'storage-status storage-error'}><span />{stored ? 'हिसाब इस ब्राउज़र में सुरक्षित है' : 'इस बार हिसाब सहेजा नहीं जा सका'}</span><button ref={resetTrigger} className="reset-button" onClick={() => setResetOpen(true)}><Icon name="refresh" size={15} />नमूना फिर से शुरू करें</button></footer>
    </main>
    {resetOpen && <div className="modal-backdrop" onClick={event => { if (event.target === event.currentTarget) closeReset(); }}><section role="dialog" aria-modal="true" aria-labelledby="reset-title" aria-describedby="reset-description" className="reset-dialog" onKeyDown={event => { if (event.key === 'Escape') closeReset(); if (event.key === 'Tab') { const buttons = Array.from(event.currentTarget.querySelectorAll('button')); const first = buttons[0]; const last = buttons[buttons.length - 1]; if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); } } }}><span className="modal-icon"><Icon name="refresh" size={26} /></span><h2 id="reset-title">नमूना फिर से शुरू करें?</h2><p id="reset-description">अभी का स्टॉक और लेन-देन हट जाएगा। दुकान के आठ नमूना सामान वापस आ जाएँगे।</p><div><button ref={cancelReset} className="cancel-button" onClick={closeReset}>रहने दें</button><button className="confirm-button" onClick={reset}>फिर से शुरू करें</button></div></section></div>}
  </>;
}
