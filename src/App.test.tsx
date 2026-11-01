import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('shop inventory screen', () => {
  // Catches losing Hindi/English search or showing non-low-stock products in the low-stock view.
  it('finds Hindi products and narrows the low-stock view to the two items needing refill', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByRole('searchbox', { name: 'सामान खोजें' }), 'चीनी');
    expect(screen.getByRole('button', { name: 'चीनी चुनें' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'चावल चुनें' })).not.toBeInTheDocument();
    await user.clear(screen.getByRole('searchbox', { name: 'सामान खोजें' }));
    await user.type(screen.getByRole('searchbox', { name: 'सामान खोजें' }), 'rice');
    expect(screen.getByRole('button', { name: 'चावल चुनें' })).toBeInTheDocument();
    await user.clear(screen.getByRole('searchbox', { name: 'सामान खोजें' }));
    await user.click(within(screen.getByRole('navigation', { name: 'स्टॉक के पृष्ठ' })).getByRole('button', { name: /कम स्टॉक/ }));
    expect(screen.getByRole('button', { name: 'दूध का पैकेट चुनें' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'नहाने का साबुन चुनें' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'चीनी चुनें' })).not.toBeInTheDocument();
  });
  // Catches the form failing to update the same stock/ledger used by the product list.
  it('records a sugar receipt in the product card and ledger', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'चीनी चुनें' }));
    fireEvent.change(screen.getByLabelText('मात्रा'), { target: { value: '1.25' } });
    await user.click(screen.getByRole('button', { name: 'माल जोड़ें' }));
    expect(within(screen.getByRole('button', { name: 'चीनी चुनें' })).getByText('16.25 किलो')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /लेन-देन/ }));
    const ledger = screen.getByRole('table', { name: 'स्टॉक का लेन-देन' });
    expect(within(ledger).getByText('1.25 किलो')).toBeInTheDocument();
    expect(within(ledger).getByText('16.25 किलो')).toBeInTheDocument();
  });
  it('rejects fractional packet input without writing a movement', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'दूध का पैकेट चुनें' }));
    fireEvent.change(screen.getByLabelText('मात्रा'), { target: { value: '1.5' } });
    await user.click(screen.getByRole('button', { name: 'माल जोड़ें' }));
    expect(screen.getByRole('alert')).toHaveTextContent('पूरे अंक');
    expect(within(screen.getByRole('button', { name: 'दूध का पैकेट चुनें' })).getByText('8 पैकेट')).toBeInTheDocument();
  });
  // Catches a missing persistence effect or reset leaving stale transactions behind.
  it('restores a receipt across visits and resets stock and ledger after confirmation', async () => {
    const user = userEvent.setup();
    const first = render(<App />);
    await user.click(screen.getByRole('button', { name: 'चीनी चुनें' }));
    fireEvent.change(screen.getByLabelText('मात्रा'), { target: { value: '1' } });
    await user.click(screen.getByRole('button', { name: 'माल जोड़ें' }));
    first.unmount();
    render(<App />);
    expect(within(screen.getByRole('button', { name: 'चीनी चुनें' })).getByText('16 किलो')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'नमूना फिर से शुरू करें' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'फिर से शुरू करें' }));
    expect(within(screen.getByRole('button', { name: 'चीनी चुनें' })).getByText('15 किलो')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /लेन-देन/ }));
    expect(screen.getByText('अभी कोई लेन-देन नहीं')).toBeInTheDocument();
  });
  it('opens the companion help experience through the support link', () => {
    render(<App />);
    expect(screen.getByRole('link', { name: 'ऐप सहायता' })).toHaveAttribute('href', 'http://127.0.0.1:4300/?lang=hi');
  });
});
