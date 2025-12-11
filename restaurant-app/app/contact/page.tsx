import { PageTransition } from '@/components/PageTransition';
import { ContactForm } from '@/components/ContactForm';

export default function ContactPage() {
  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-5xl font-serif text-center mb-4 text-accent-gold">
          Contact Us
        </h1>
        <p className="text-center text-text-secondary mb-12 max-w-2xl mx-auto">
          We&apos;d love to hear from you. Reach out with any questions or
          feedback.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <h2 className="text-2xl font-serif text-accent-gold mb-6">
              Send Us a Message
            </h2>
            <ContactForm />
          </div>

          {/* Contact Information */}
          <div>
            <h2 className="text-2xl font-serif text-accent-gold mb-6">
              Visit Us
            </h2>

            <div className="space-y-6 mb-8">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Address
                </h3>
                <p className="text-text-secondary">
                  123 Gourmet Street
                  <br />
                  Culinary District
                  <br />
                  New York, NY 10001
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Phone
                </h3>
                <p className="text-text-secondary">(555) 123-4567</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Email
                </h3>
                <p className="text-text-secondary">info@restaurant.com</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Hours
                </h3>
                <div className="text-text-secondary space-y-1">
                  <p>Tuesday - Thursday: 5:00 PM - 10:00 PM</p>
                  <p>Friday - Saturday: 5:00 PM - 11:00 PM</p>
                  <p>Sunday: 4:00 PM - 9:00 PM</p>
                  <p className="text-accent-gold">Monday: Closed</p>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="bg-surface rounded-lg border border-white/10 h-64 flex items-center justify-center">
              <p className="text-text-secondary">Map Placeholder</p>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
