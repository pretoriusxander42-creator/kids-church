'use client';

import { useState, FormEvent } from 'react';
import { PrimaryButton } from './PrimaryButton';

const occasions = [
  'Birthday',
  'Anniversary',
  'Business Dinner',
  'Date Night',
  'Special Celebration',
  'Other',
];

export function ReservationForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    guests: '2',
    occasion: '',
    notes: '',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setCurrentStep(3); // Move to confirmation step
        // Reset form after success
        setTimeout(() => {
          setFormData({
            fullName: '',
            email: '',
            phone: '',
            date: '',
            time: '',
            guests: '2',
            occasion: '',
            notes: '',
          });
          setCurrentStep(1);
          setSubmitStatus('idle');
        }, 5000);
      } else {
        const errorData = await response.json();
        setSubmitStatus('error');
        setErrorMessage(errorData.error || 'Failed to create reservation');
      }
    } catch {
      setSubmitStatus('error');
      setErrorMessage('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceedToStep2 = formData.fullName && formData.email && formData.phone;
  const canSubmit = canProceedToStep2 && formData.date && formData.time && formData.guests;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Step indicator */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center gap-4">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                  currentStep >= step
                    ? 'bg-accent-gold text-background'
                    : 'bg-surface text-text-secondary border border-white/20'
                }`}
              >
                {step}
              </div>
              {step < 3 && (
                <div
                  className={`w-12 h-0.5 mx-2 transition-colors ${
                    currentStep > step ? 'bg-accent-gold' : 'bg-surface'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Personal Details */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-serif text-accent-gold mb-4">
              Your Details
            </h2>

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium mb-2">
                Full Name *
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-surface border border-white/20 rounded-lg focus:border-accent-gold focus:outline-none text-foreground"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-surface border border-white/20 rounded-lg focus:border-accent-gold focus:outline-none text-foreground"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-surface border border-white/20 rounded-lg focus:border-accent-gold focus:outline-none text-foreground"
              />
            </div>

            <PrimaryButton
              type="button"
              onClick={() => setCurrentStep(2)}
              disabled={!canProceedToStep2}
              className="w-full"
            >
              Continue to Date & Time
            </PrimaryButton>
          </div>
        )}

        {/* Step 2: Date & Time */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-serif text-accent-gold mb-4">
              Date & Time
            </h2>

            <div>
              <label htmlFor="date" className="block text-sm font-medium mb-2">
                Date *
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 bg-surface border border-white/20 rounded-lg focus:border-accent-gold focus:outline-none text-foreground"
              />
            </div>

            <div>
              <label htmlFor="time" className="block text-sm font-medium mb-2">
                Time *
              </label>
              <input
                type="time"
                id="time"
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-surface border border-white/20 rounded-lg focus:border-accent-gold focus:outline-none text-foreground"
              />
            </div>

            <div>
              <label htmlFor="guests" className="block text-sm font-medium mb-2">
                Number of Guests *
              </label>
              <select
                id="guests"
                name="guests"
                value={formData.guests}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-surface border border-white/20 rounded-lg focus:border-accent-gold focus:outline-none text-foreground"
              >
                {[...Array(20)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1} {i === 0 ? 'Guest' : 'Guests'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="occasion" className="block text-sm font-medium mb-2">
                Occasion (Optional)
              </label>
              <select
                id="occasion"
                name="occasion"
                value={formData.occasion}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-surface border border-white/20 rounded-lg focus:border-accent-gold focus:outline-none text-foreground"
              >
                <option value="">Select an occasion</option>
                {occasions.map((occasion) => (
                  <option key={occasion} value={occasion}>
                    {occasion}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium mb-2">
                Special Requests (Optional)
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 bg-surface border border-white/20 rounded-lg focus:border-accent-gold focus:outline-none text-foreground resize-none"
                placeholder="Dietary restrictions, accessibility needs, etc."
              />
            </div>

            <div className="flex gap-4">
              <PrimaryButton
                type="button"
                onClick={() => setCurrentStep(1)}
                variant="outline"
                className="flex-1"
              >
                Back
              </PrimaryButton>
              <PrimaryButton
                type="submit"
                disabled={!canSubmit || isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? 'Submitting...' : 'Confirm Reservation'}
              </PrimaryButton>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {currentStep === 3 && submitStatus === 'success' && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-accent-gold rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-background"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-serif text-accent-gold mb-4">
              Reservation Confirmed!
            </h2>
            <p className="text-foreground mb-2">
              Thank you, {formData.fullName}!
            </p>
            <p className="text-text-secondary">
              We&apos;ve sent a confirmation email to {formData.email}
            </p>
          </div>
        )}

        {/* Error message */}
        {submitStatus === 'error' && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400">
            {errorMessage}
          </div>
        )}
      </form>
    </div>
  );
}
