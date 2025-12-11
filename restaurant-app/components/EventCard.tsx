'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface EventCardProps {
  title: string;
  date: string;
  startTime: string;
  description: string;
  capacity?: number;
  currentRsvps?: number;
}

export function EventCard({
  title,
  date,
  startTime,
  description,
  capacity,
  currentRsvps = 0,
}: EventCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Format date for display
  const eventDate = new Date(date);
  const day = eventDate.getDate();
  const month = eventDate.toLocaleDateString('en-US', { month: 'short' });

  return (
    <motion.div
      className="bg-surface border border-white/10 rounded-lg overflow-hidden cursor-pointer"
      onClick={() => setIsExpanded(!isExpanded)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setIsExpanded(!isExpanded);
        }
      }}
      tabIndex={0}
      role="button"
      aria-expanded={isExpanded}
      aria-label={`Event: ${title}`}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="p-6 flex gap-6">
        {/* Calendar-style date */}
        <div className="flex-shrink-0 w-20 h-20 bg-accent-gold rounded-lg flex flex-col items-center justify-center text-background">
          <div className="text-3xl font-bold leading-none">{day}</div>
          <div className="text-sm uppercase">{month}</div>
        </div>

        {/* Event info */}
        <div className="flex-1">
          <h3 className="text-2xl font-serif text-accent-gold mb-2">
            {title}
          </h3>
          <p className="text-text-secondary mb-2">{startTime}</p>

          {capacity && (
            <p className="text-sm text-text-secondary">
              {currentRsvps} / {capacity} attending
            </p>
          )}
        </div>

        {/* Expand indicator */}
        <motion.div
          className="flex-shrink-0 text-accent-gold"
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </motion.div>
      </div>

      {/* Expandable description */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-white/10 overflow-hidden"
          >
            <div className="p-6 pt-4">
              <p className="text-foreground leading-relaxed">{description}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
