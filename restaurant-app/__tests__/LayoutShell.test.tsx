import { render, screen } from '@testing-library/react';
import { LayoutShell } from '@/components/LayoutShell';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

describe('LayoutShell', () => {
  it('renders navigation links', () => {
    render(
      <LayoutShell>
        <div>Content</div>
      </LayoutShell>
    );

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Menu')).toBeInTheDocument();
    expect(screen.getByText('Reservations')).toBeInTheDocument();
    expect(screen.getByText('Events')).toBeInTheDocument();
    expect(screen.getByText('Gallery')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });

  it('renders footer with copyright', () => {
    render(
      <LayoutShell>
        <div>Content</div>
      </LayoutShell>
    );

    const currentYear = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`${currentYear}`))).toBeInTheDocument();
  });

  it('renders children content', () => {
    render(
      <LayoutShell>
        <div>Test Content</div>
      </LayoutShell>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});
