'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ButtonHTMLAttributes, AnchorHTMLAttributes } from 'react';

type ButtonVariant = 'solid' | 'outline';

type ButtonAsButton = ButtonHTMLAttributes<HTMLButtonElement> & {
  as?: 'button';
  variant?: ButtonVariant;
  children: React.ReactNode;
};

type ButtonAsLink = AnchorHTMLAttributes<HTMLAnchorElement> & {
  as: 'a';
  href: string;
  variant?: ButtonVariant;
  children: React.ReactNode;
};

type PrimaryButtonProps = ButtonAsButton | ButtonAsLink;

export function PrimaryButton(props: PrimaryButtonProps) {
  const { variant = 'solid', children, className = '' } = props;

  const baseClasses =
    'relative overflow-hidden px-8 py-3 font-semibold transition-all duration-300 rounded-md';

  const variantClasses = {
    solid: 'bg-accent-gold text-background hover:bg-accent-gold-dark',
    outline:
      'border-2 border-accent-gold text-accent-gold hover:text-background',
  };

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${className}`;

  if (props.as === 'a' && props.href) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { as, variant: _variant, ...linkProps } = props;
    return (
      <Link {...linkProps} className={combinedClasses}>
        <motion.span
          className="relative z-10 block"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {children}
        </motion.span>
        {variant === 'outline' && (
          <motion.span
            className="absolute inset-0 bg-accent-gold"
            initial={{ x: '-100%' }}
            whileHover={{ x: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </Link>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { as, variant: _variant, ...buttonProps } = props as ButtonAsButton;
  return (
    <motion.button
      {...buttonProps}
      className={combinedClasses}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <span className="relative z-10">{children}</span>
      {variant === 'outline' && (
        <motion.span
          className="absolute inset-0 bg-accent-gold"
          initial={{ x: '-100%' }}
          whileHover={{ x: 0 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.button>
  );
}
