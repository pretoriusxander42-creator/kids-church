import { PageTransition } from '@/components/PageTransition';
import { HorizontalGallery } from '@/components/HorizontalGallery';

// Mock gallery images
const galleryImages = [
  {
    src: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
    alt: 'Elegant dining room',
  },
  {
    src: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800',
    alt: 'Gourmet dish presentation',
  },
  {
    src: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800',
    alt: 'Chef preparing cuisine',
  },
  {
    src: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800',
    alt: 'Intimate dining atmosphere',
  },
  {
    src: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
    alt: 'Restaurant interior',
  },
  {
    src: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
    alt: 'Bar area',
  },
];

export default function GalleryPage() {
  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-5xl font-serif text-center mb-4 text-accent-gold">
          Gallery
        </h1>
        <p className="text-center text-text-secondary mb-12 max-w-2xl mx-auto">
          Take a visual journey through our restaurant and cuisine
        </p>

        <HorizontalGallery images={galleryImages} />

        <p className="text-center text-text-secondary mt-8 text-sm">
          Tip: Click on any image to view it in full size
        </p>
      </div>
    </PageTransition>
  );
}
