import { render, screen } from '@testing-library/react';
import { PrimaryButton } from '@/components/PrimaryButton';

describe('PrimaryButton', () => {
  it('renders children correctly', () => {
    render(<PrimaryButton>Click Me</PrimaryButton>);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('applies solid variant classes by default', () => {
    render(<PrimaryButton>Solid</PrimaryButton>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-accent-gold');
  });

  it('applies outline variant classes when specified', () => {
    render(<PrimaryButton variant="outline">Outline</PrimaryButton>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('border-accent-gold');
  });

  it('renders as button element by default', () => {
    render(<PrimaryButton>Button</PrimaryButton>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders as link element when as="a" with href', () => {
    render(
      <PrimaryButton as="a" href="/test">
        Link
      </PrimaryButton>
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/test');
  });
});
