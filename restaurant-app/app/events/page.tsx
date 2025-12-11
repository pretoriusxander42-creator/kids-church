import { PageTransition } from '@/components/PageTransition';
import { EventCard } from '@/components/EventCard';

interface Event {
  _id: string;
  title: string;
  date: string;
  startTime: string;
  description: string;
  capacity: number;
  currentRsvps: number;
}

// Fetch events data from API
async function getEventsData(): Promise<Event[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/events`, {
      cache: 'no-store', // Always fetch fresh data
    });

    if (!res.ok) {
      throw new Error('Failed to fetch events');
    }

    return res.json();
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
}

export default async function EventsPage() {
  const events = await getEventsData();

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-5xl font-serif text-center mb-4 text-accent-gold">
          Upcoming Events
        </h1>
        <p className="text-center text-text-secondary mb-12 max-w-2xl mx-auto">
          Join us for special culinary experiences and celebrations
        </p>

        {events.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-text-secondary text-lg">
              No upcoming events at the moment. Check back soon!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {events.map((event) => (
              <EventCard
                key={event._id}
                title={event.title}
                date={event.date}
                startTime={event.startTime}
                description={event.description}
                capacity={event.capacity}
                currentRsvps={event.currentRsvps}
              />
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
