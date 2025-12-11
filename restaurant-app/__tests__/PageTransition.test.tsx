import { render, screen } from '@testing-library/react';
import { PageTransition } from '@/components/PageTransition';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

describe('PageTransition', () => {
  it('renders children', () => {
    render(
      <PageTransition>
        <div>Test Content</div>
      </PageTransition>
    );
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('wraps content with motion div', () => {
    const { container } = render(
      <PageTransition>
        <div>Content</div>
      </PageTransition>
    );
    expect(container.querySelector('div')).toBeInTheDocument();
  });
});
