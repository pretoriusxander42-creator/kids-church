import { render, screen } from '@testing-library/react';
import Home from '@/app/page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

describe('Home Page', () => {
  it('renders the main heading', () => {
    render(<Home />);
    expect(
      screen.getByText('Experience Culinary Excellence')
    ).toBeInTheDocument();
  });

  it('renders reservation button with correct link', () => {
    render(<Home />);
    const reservationBtn = screen.getByText('Make a Reservation');
    expect(reservationBtn.closest('a')).toHaveAttribute(
      'href',
      '/reservations'
    );
  });

  it('renders menu button with correct link', () => {
    render(<Home />);
    const menuBtn = screen.getByText('View Menu');
    expect(menuBtn.closest('a')).toHaveAttribute('href', '/menu');
  });
});
