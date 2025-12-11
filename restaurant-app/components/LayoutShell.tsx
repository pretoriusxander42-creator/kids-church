'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

const navigationLinks = [
  { href: '/', label: 'Home' },
  { href: '/menu', label: 'Menu' },
  { href: '/reservations', label: 'Reservations' },
  { href: '/events', label: 'Events' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/about', label: 'About' },
];

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <>
      {/* Floating Navigation Bar */}
      <motion.nav
        className="fixed top-4 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-6xl"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-surface/80 backdrop-blur-md rounded-full px-6 py-4 shadow-xl border border-white/10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Logo/Brand */}
            <Link
              href="/"
              className="text-xl font-serif font-bold text-accent-gold"
            >
              Fine Dining
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center gap-6 flex-wrap">
              {navigationLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-accent-gold ${
                    pathname === link.href
                      ? 'text-accent-gold'
                      : 'text-foreground'
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {/* Contact CTA Button */}
              <Link
                href="/contact"
                className="bg-accent-gold text-background px-6 py-2 rounded-full font-semibold text-sm hover:bg-accent-gold-dark transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>

          {/* Mobile responsive - full width bar on small screens */}
          <style jsx>{`
            @media (max-width: 768px) {
              nav {
                width: 100%;
                border-radius: 0;
              }
            }
          `}</style>
        </div>
      </motion.nav>

      {/* Main Content with padding for fixed nav */}
      <main className="pt-24 min-h-screen">{children}</main>

      {/* Minimal Footer */}
      <footer className="border-t border-white/10 py-6 mt-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-text-secondary text-sm">
            <span className="font-serif text-accent-gold">Fine Dining</span>{' '}
            &copy; {new Date().getFullYear()} · All rights reserved
          </p>
        </div>
      </footer>
    </>
  );
}
