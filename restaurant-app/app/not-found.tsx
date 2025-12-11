import { PrimaryButton } from '@/components/PrimaryButton';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-serif text-accent-gold mb-4">404</h1>
        <h2 className="text-3xl font-serif text-foreground mb-6">
          Page Not Found
        </h2>
        <p className="text-text-secondary mb-8 max-w-md">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <PrimaryButton as="a" href="/">
          Return Home
        </PrimaryButton>
      </div>
    </div>
  );
}
