import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

const preferenceKey = 'kirana-saathi.language.v1';
const inventoryKey = 'kirana-saathi.inventory.v1';

beforeEach(() => { window.history.replaceState({}, '', '/'); });
afterEach(() => { vi.restoreAllMocks(); window.history.replaceState({}, '', '/'); });

describe('inventory language choice', () => {
  // Catches switching languages reinitializing inventory, clearing inputs, or losing the current ledger view.
  it('switches both ways while keeping entered quantities, search, stock and ledger', async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(screen.getByRole('button', { name: 'हिन्दी' })).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('button', { name: 'चीनी चुनें' }));
    fireEvent.change(screen.getByLabelText('मात्रा'), { target: { value: '1.25' } });
    await user.click(screen.getByRole('button', { name: 'माल जोड़ें' }));
    const saved = localStorage.getItem(inventoryKey);
    fireEvent.change(screen.getByLabelText('मात्रा'), { target: { value: '0.5' } });
    await user.type(screen.getByRole('searchbox'), 'sugar');
    await user.click(screen.getByRole('button', { name: 'English' }));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('My shop inventory');
    expect(screen.getByRole('button', { name: 'English' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByLabelText('Quantity')).toHaveValue(0.5);
    expect(screen.getByRole('searchbox')).toHaveValue('sugar');
    expect(screen.getByLabelText('Product')).toHaveValue('sugar');
    expect(within(screen.getByRole('button', { name: 'Select Sugar' })).getByText('16.25 kg')).toBeInTheDocument();
    expect(localStorage.getItem(inventoryKey)).toBe(saved);
    await user.click(screen.getByRole('button', { name: /Transactions/ }));
    let ledger = screen.getByRole('table', { name: 'Stock transactions' });
    expect(within(ledger).getByText('Sugar')).toBeInTheDocument();
    expect(within(ledger).getByText('1.25 kg')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'हिन्दी' }));
    ledger = screen.getByRole('table', { name: 'स्टॉक का लेन-देन' });
    expect(within(ledger).getByText('चीनी')).toBeInTheDocument();
    expect(within(ledger).getByText('16.25 किलो')).toBeInTheDocument();
    expect(screen.getByLabelText('मात्रा')).toHaveValue(0.5);
    expect(localStorage.getItem(inventoryKey)).toBe(saved);
  });

  // Catches missing display translations and untranslated validation errors from the canonical inventory module.
  it('shows English product search, categories, table units and validation without recording rejected input', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'English' }));
    await user.type(screen.getByRole('searchbox', { name: 'Search products' }), 'mustard oil');
    expect(screen.getByRole('button', { name: 'Select Mustard oil' })).toHaveTextContent('10 litres');
    await user.click(screen.getByRole('button', { name: 'View as table' }));
    const table = screen.getByRole('table', { name: 'Product stock' });
    expect(within(table).getByText('Kitchen essentials')).toBeInTheDocument();
    expect(within(table).getByText('/ litre')).toBeInTheDocument();
    await user.clear(screen.getByRole('searchbox'));
    await user.selectOptions(screen.getByLabelText('Product'), 'milk');
    fireEvent.change(screen.getByLabelText('Quantity'), { target: { value: '1.5' } });
    await user.click(screen.getByRole('button', { name: 'Add stock' }));
    expect(screen.getByRole('alert')).toHaveTextContent('whole numbers');
    expect(screen.getByLabelText('Quantity')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('8 packets', { selector: '.available-stock strong' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'हिन्दी' }));
    expect(screen.getByRole('alert')).toHaveTextContent('पूरे अंक');
    await user.click(screen.getByRole('button', { name: 'English' }));
    await user.selectOptions(screen.getByLabelText('Product'), 'sugar');
    fireEvent.change(screen.getByLabelText('Quantity'), { target: { value: '0' } });
    await user.click(screen.getByRole('button', { name: 'Add stock' }));
    expect(screen.getByRole('alert')).toHaveTextContent('greater than zero');
    fireEvent.change(screen.getByLabelText('Quantity'), { target: { value: '0.0001' } });
    await user.click(screen.getByRole('button', { name: 'Add stock' }));
    expect(screen.getByRole('alert')).toHaveTextContent('three decimal places');
    await user.click(screen.getByRole('button', { name: 'Sold' }));
    fireEvent.change(screen.getByLabelText('Quantity'), { target: { value: '16' } });
    await user.click(screen.getByRole('button', { name: 'Record sale' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Not enough stock');
    await user.click(screen.getByRole('button', { name: /Transactions/ }));
    expect(screen.getByText('No transactions yet')).toBeInTheDocument();
  });

  // Catches success/reset feedback remaining in the previous language or resetting the language preference.
  it('translates existing success feedback and the reset confirmation', async () => {
    const user = userEvent.setup();
    render(<App />);
    fireEvent.change(screen.getByLabelText('मात्रा'), { target: { value: '1' } });
    await user.click(screen.getByRole('button', { name: 'माल जोड़ें' }));
    await user.click(screen.getByRole('button', { name: 'English' }));
    expect(screen.getByRole('status')).toHaveTextContent('Stock added for Sugar.');
    await user.click(screen.getByRole('button', { name: 'Reset sample shop' }));
    const dialog = screen.getByRole('dialog', { name: 'Reset sample shop?' });
    expect(dialog).toHaveTextContent('Current stock and transactions will be removed');
    expect(within(dialog).getByRole('button', { name: 'Keep my stock' })).toHaveFocus();
    await user.click(within(dialog).getByRole('button', { name: 'Reset shop' }));
    expect(screen.getByRole('status')).toHaveTextContent('The sample shop has been reset.');
    expect(screen.getByRole('button', { name: 'English' })).toHaveAttribute('aria-pressed', 'true');
    expect(within(screen.getByRole('button', { name: 'Select Sugar' })).getByText('15 kg')).toBeInTheDocument();
  });

  // Catches a missing persisted preference or wrong document metadata on a return visit.
  it('remembers English across reloads and updates the document language and title', async () => {
    const user = userEvent.setup();
    const first = render(<App />);
    await user.click(screen.getByRole('button', { name: 'English' }));
    expect(localStorage.getItem(preferenceKey)).toBe('en');
    expect(document.documentElement.lang).toBe('en');
    expect(document.title).toBe('Kirana Saathi · Your shop companion');
    first.unmount();
    render(<App />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('My shop inventory');
    await user.click(screen.getByRole('button', { name: 'हिन्दी' }));
    expect(localStorage.getItem(preferenceKey)).toBe('hi');
    expect(document.documentElement.lang).toBe('hi');
    expect(document.title).toBe('किराना साथी · दुकान का अपना साथी');
  });

  // Catches query preferences being ignored, or a help link opening the console in the other language.
  it('honors valid language queries over saved preference and passes the choice to help', async () => {
    localStorage.setItem(preferenceKey, 'hi');
    window.history.replaceState({}, '', '/?lang=en');
    const first = render(<App />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('My shop inventory');
    const help = new URL(screen.getByRole('link', { name: 'App help' }).getAttribute('href')!);
    expect(help.origin).toBe('http://127.0.0.1:4300');
    expect(help.searchParams.get('lang')).toBe('en');
    first.unmount();
    window.history.replaceState({}, '', '/?lang=hi');
    render(<App />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('मेरी दुकान का स्टॉक');
    const hindiHelp = new URL(screen.getByRole('link', { name: 'ऐप सहायता' }).getAttribute('href')!);
    expect(hindiHelp.searchParams.get('lang')).toBe('hi');
  });

  it('ignores invalid queries and stored preferences', () => {
    localStorage.setItem(preferenceKey, 'en');
    window.history.replaceState({}, '', '/?lang=fr');
    const first = render(<App />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('My shop inventory');
    first.unmount();
    localStorage.setItem(preferenceKey, 'fr');
    render(<App />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('मेरी दुकान का स्टॉक');
  });

  // Catches a stale query overriding the language chosen in the header when the page reloads.
  it('keeps a language chosen from an English link across reloads', async () => {
    const user = userEvent.setup();
    window.history.replaceState({}, '', '/?lang=en&demo=stock#main');
    const first = render(<App />);
    await user.click(screen.getByRole('button', { name: 'हिन्दी' }));
    expect(new URLSearchParams(window.location.search).get('lang')).toBe('hi');
    expect(new URLSearchParams(window.location.search).get('demo')).toBe('stock');
    expect(window.location.hash).toBe('#main');
    first.unmount();
    render(<App />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('मेरी दुकान का स्टॉक');
    expect(localStorage.getItem(preferenceKey)).toBe('hi');
  });

  // Catches unsafe localStorage access making the entire app unusable when browser storage is blocked.
  it('can still switch languages and use a query when browser storage is blocked', async () => {
    const user = userEvent.setup();
    window.history.replaceState({}, '', '/?lang=en');
    vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => { throw new DOMException('Blocked', 'SecurityError'); });
    render(<App />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('My shop inventory');
    expect(screen.getByText('Your inventory could not be saved this time')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'हिन्दी' }));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('मेरी दुकान का स्टॉक');
    vi.restoreAllMocks();
  });
});
