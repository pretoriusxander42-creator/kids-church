'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface MenuItemCardProps {
  title: string;
  price: number;
  description: string;
  tags?: string[];
  imageUrl?: string;
}

export function MenuItemCard({
  title,
  price,
  description,
  tags = [],
}: MenuItemCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <motion.div
      className="relative h-64 cursor-pointer"
      onHoverStart={() => setIsFlipped(true)}
      onHoverEnd={() => setIsFlipped(false)}
      onFocus={() => setIsFlipped(true)}
      onBlur={() => setIsFlipped(false)}
      tabIndex={0}
      role="button"
      aria-label={`Menu item: ${title}`}
    >
      {/* Front of card */}
      <motion.div
        className="absolute inset-0 bg-surface border border-white/10 rounded-lg p-6 flex flex-col justify-between"
        initial={false}
        animate={{
          rotateY: isFlipped ? 180 : 0,
          opacity: isFlipped ? 0 : 1,
        }}
        transition={{ duration: 0.4 }}
        style={{ backfaceVisibility: 'hidden' }}
      >
        <div>
          <h3 className="text-2xl font-serif text-accent-gold mb-2">
            {title}
          </h3>
          <p className="text-3xl font-bold text-foreground">
            ${price.toFixed(2)}
          </p>
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="text-xs px-2 py-1 bg-accent-gold/20 text-accent-gold rounded-full"
              >
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="text-xs px-2 py-1 bg-accent-gold/20 text-accent-gold rounded-full">
                +{tags.length - 3}
              </span>
            )}
          </div>
        )}
      </motion.div>

      {/* Back of card */}
      <motion.div
        className="absolute inset-0 bg-accent-gold/10 border border-accent-gold rounded-lg p-6 flex flex-col justify-center"
        initial={false}
        animate={{
          rotateY: isFlipped ? 0 : -180,
          opacity: isFlipped ? 1 : 0,
        }}
        transition={{ duration: 0.4 }}
        style={{ backfaceVisibility: 'hidden' }}
      >
        <p className="text-foreground mb-4">{description}</p>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, idx) => (
              <span
                key={idx}
                className="text-xs px-2 py-1 bg-accent-gold/30 text-accent-gold rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
