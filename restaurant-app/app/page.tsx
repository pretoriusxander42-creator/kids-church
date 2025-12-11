import { PrimaryButton } from '@/components/PrimaryButton';
import { PageTransition } from '@/components/PageTransition';

export default function Home() {
  return (
    <PageTransition>
      {/* Hero Section - Placeholder for video hero */}
      <section className="relative h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40 z-10"></div>
        
        {/* Placeholder for video background */}
        <div className="absolute inset-0 bg-gradient-to-br from-surface to-background"></div>

        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-6xl md:text-7xl font-serif mb-6 text-accent-gold">
            Experience Culinary Excellence
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-foreground">
            An intimate dining experience where every dish tells a story
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <PrimaryButton as="a" href="/reservations" variant="solid">
              Make a Reservation
            </PrimaryButton>
            <PrimaryButton as="a" href="/menu" variant="outline">
              View Menu
            </PrimaryButton>
          </div>
        </div>
      </section>

      {/* Featured Dishes Section - Placeholder */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-serif text-center mb-12 text-accent-gold">
            Featured Dishes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-surface rounded-lg p-6 h-64 flex items-center justify-center border border-white/10"
              >
                <p className="text-text-secondary">Dish Placeholder {i}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events Section - Placeholder */}
      <section className="py-20 px-4 bg-surface">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-serif text-center mb-12 text-accent-gold">
            Upcoming Events
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="bg-background rounded-lg p-8 border border-white/10"
              >
                <p className="text-text-secondary">Event Placeholder {i}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location Section - Placeholder */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-serif mb-8 text-accent-gold">
            Visit Us
          </h2>
          <div className="bg-surface rounded-lg p-12 border border-white/10">
            <p className="text-text-secondary">Map Placeholder</p>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
