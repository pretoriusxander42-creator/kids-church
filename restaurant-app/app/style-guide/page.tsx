import { PrimaryButton } from '@/components/PrimaryButton';

export default function StyleGuidePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-5xl font-serif mb-8 text-accent-gold">
        Style Guide
      </h1>

      {/* Typography */}
      <section className="mb-16">
        <h2 className="text-3xl font-serif mb-6 text-accent-gold">
          Typography
        </h2>

        <div className="space-y-4">
          <div>
            <h1 className="text-5xl font-serif mb-2">Heading 1</h1>
            <p className="text-text-secondary text-sm">
              Playfair Display - 48px
            </p>
          </div>

          <div>
            <h2 className="text-4xl font-serif mb-2">Heading 2</h2>
            <p className="text-text-secondary text-sm">
              Playfair Display - 36px
            </p>
          </div>

          <div>
            <h3 className="text-3xl font-serif mb-2">Heading 3</h3>
            <p className="text-text-secondary text-sm">
              Playfair Display - 30px
            </p>
          </div>

          <div>
            <h4 className="text-2xl font-serif mb-2">Heading 4</h4>
            <p className="text-text-secondary text-sm">
              Playfair Display - 24px
            </p>
          </div>

          <div className="pt-4">
            <p className="text-base mb-2">
              Body text - This is a sample paragraph showing the default body
              text style. It uses the Inter font family for optimal readability
              on screen. The line height is set to 1.6 for comfortable reading.
            </p>
            <p className="text-text-secondary text-sm">Inter - 16px</p>
          </div>
        </div>
      </section>

      {/* Colors */}
      <section className="mb-16">
        <h2 className="text-3xl font-serif mb-6 text-accent-gold">
          Color Palette
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <div className="w-full h-24 bg-background rounded-lg border border-white/20 mb-2"></div>
            <p className="font-medium">Background</p>
            <p className="text-text-secondary text-sm">#0a0a0a</p>
          </div>

          <div>
            <div className="w-full h-24 bg-surface rounded-lg border border-white/20 mb-2"></div>
            <p className="font-medium">Surface</p>
            <p className="text-text-secondary text-sm">#1a1a1a</p>
          </div>

          <div>
            <div className="w-full h-24 bg-accent-gold rounded-lg mb-2"></div>
            <p className="font-medium">Accent Gold</p>
            <p className="text-text-secondary text-sm">#d4af37</p>
          </div>

          <div>
            <div className="w-full h-24 bg-accent-gold-dark rounded-lg mb-2"></div>
            <p className="font-medium">Accent Gold Dark</p>
            <p className="text-text-secondary text-sm">#b8941f</p>
          </div>

          <div>
            <div className="w-full h-24 bg-foreground rounded-lg mb-2"></div>
            <p className="font-medium text-background">Foreground</p>
            <p className="text-background/70 text-sm">#f5f5f5</p>
          </div>

          <div>
            <div className="w-full h-24 bg-text-secondary rounded-lg mb-2"></div>
            <p className="font-medium">Text Secondary</p>
            <p className="text-text-secondary text-sm">#a0a0a0</p>
          </div>
        </div>
      </section>

      {/* Buttons */}
      <section className="mb-16">
        <h2 className="text-3xl font-serif mb-6 text-accent-gold">Buttons</h2>

        <div className="flex flex-wrap gap-4">
          <PrimaryButton variant="solid">Solid Button</PrimaryButton>
          <PrimaryButton variant="outline">Outline Button</PrimaryButton>
          <PrimaryButton as="a" href="#" variant="solid">
            Link as Button
          </PrimaryButton>
        </div>
      </section>

      {/* Spacing */}
      <section className="mb-16">
        <h2 className="text-3xl font-serif mb-6 text-accent-gold">Spacing</h2>

        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <div className="w-16 h-4 bg-accent-gold rounded"></div>
            <p className="text-text-secondary">4px - xs</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-32 h-4 bg-accent-gold rounded"></div>
            <p className="text-text-secondary">8px - sm</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-48 h-4 bg-accent-gold rounded"></div>
            <p className="text-text-secondary">16px - md</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-64 h-4 bg-accent-gold rounded"></div>
            <p className="text-text-secondary">24px - lg</p>
          </div>
        </div>
      </section>
    </div>
  );
}
