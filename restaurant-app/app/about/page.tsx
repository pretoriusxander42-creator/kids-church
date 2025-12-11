import { PageTransition } from '@/components/PageTransition';

export default function AboutPage() {
  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-5xl font-serif text-center mb-12 text-accent-gold">
          About Us
        </h1>

        {/* Restaurant Story */}
        <section className="mb-16">
          <h2 className="text-3xl font-serif text-accent-gold mb-6">
            Our Story
          </h2>
          <div className="space-y-4 text-foreground leading-relaxed">
            <p>
              Founded in 2015, our restaurant has been dedicated to bringing you
              an exceptional dining experience that celebrates both tradition and
              innovation. Every dish tells a story, crafted with passion and the
              finest ingredients sourced from local farms and trusted suppliers.
            </p>
            <p>
              We believe that great food brings people together. Our intimate
              atmosphere and attention to detail create the perfect setting for
              memorable moments, whether you&apos;re celebrating a special
              occasion or simply enjoying an evening out.
            </p>
            <p>
              Our commitment to excellence extends beyond the plate. We take
              pride in providing warm, personalized service that makes every
              guest feel at home.
            </p>
          </div>
        </section>

        {/* Chef Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-serif text-accent-gold mb-6">
            Our Chef
          </h2>
          <div className="bg-surface rounded-lg p-8 border border-white/10">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="w-48 h-48 bg-accent-gold/20 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-6xl">👨‍🍳</span>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-serif text-accent-gold mb-2">
                  Chef Alessandro Romano
                </h3>
                <p className="text-text-secondary mb-4">
                  Executive Chef & Owner
                </p>
                <p className="text-foreground leading-relaxed">
                  With over 20 years of culinary experience spanning Michelin-starred
                  kitchens across Europe, Chef Alessandro brings his passion for
                  traditional techniques and modern creativity to every dish. His
                  philosophy is simple: respect the ingredients, honor the craft,
                  and create experiences that linger long after the last bite.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section>
          <h2 className="text-3xl font-serif text-accent-gold mb-6">
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface rounded-lg p-6 border border-white/10">
              <h3 className="text-xl font-serif text-accent-gold mb-3">
                Quality
              </h3>
              <p className="text-text-secondary">
                We source only the finest ingredients, working directly with
                local farmers and suppliers who share our commitment to
                excellence.
              </p>
            </div>
            <div className="bg-surface rounded-lg p-6 border border-white/10">
              <h3 className="text-xl font-serif text-accent-gold mb-3">
                Sustainability
              </h3>
              <p className="text-text-secondary">
                Environmental responsibility is at our core. We prioritize
                sustainable practices and seasonal ingredients.
              </p>
            </div>
            <div className="bg-surface rounded-lg p-6 border border-white/10">
              <h3 className="text-xl font-serif text-accent-gold mb-3">
                Hospitality
              </h3>
              <p className="text-text-secondary">
                Every guest is family. We create warm, welcoming experiences
                that make you want to return again and again.
              </p>
            </div>
          </div>
        </section>
      </div>
    </PageTransition>
  );
}
