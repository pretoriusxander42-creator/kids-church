import { PageTransition } from '@/components/PageTransition';
import { ReservationForm } from '@/components/ReservationForm';

export default function ReservationsPage() {
  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-5xl font-serif text-center mb-4 text-accent-gold">
          Make a Reservation
        </h1>
        <p className="text-center text-text-secondary mb-12 max-w-2xl mx-auto">
          Reserve your table and experience an unforgettable dining experience
        </p>

        <ReservationForm />
      </div>
    </PageTransition>
  );
}
