'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface GalleryImage {
  src: string;
  alt: string;
}

interface HorizontalGalleryProps {
  images: GalleryImage[];
}

export function HorizontalGallery({ images }: HorizontalGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  return (
    <>
      {/* Horizontal scroll container */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {images.map((image, idx) => (
            <motion.div
              key={idx}
              className="w-80 h-64 bg-surface rounded-lg overflow-hidden cursor-pointer border border-white/10 flex-shrink-0"
              whileHover={{ scale: 1.05 }}
              onClick={() => setSelectedImage(idx)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedImage(idx);
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`View ${image.alt}`}
            >
              <div className="relative w-full h-full">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox overlay */}
      <AnimatePresence>
        {selectedImage !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-6xl max-h-[80vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-full h-[70vh]">
                <Image
                  src={images[selectedImage].src}
                  alt={images[selectedImage].alt}
                  fill
                  className="object-contain"
                />
              </div>

              {/* Close button */}
              <button
                className="absolute top-4 right-4 w-10 h-10 bg-accent-gold rounded-full flex items-center justify-center text-background hover:bg-accent-gold-dark transition-colors"
                onClick={() => setSelectedImage(null)}
                aria-label="Close lightbox"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
