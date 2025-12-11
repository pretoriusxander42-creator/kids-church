'use client';

import { useState, FormEvent } from 'react';
import { PrimaryButton } from './PrimaryButton';

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    // Simulate submission (no actual API endpoint for contact form)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setSubmitStatus('success');
    setIsSubmitting(false);

    // Reset form
    setTimeout(() => {
      setFormData({ name: '', email: '', message: '' });
      setSubmitStatus('idle');
    }, 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-2">
          Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
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
        <label htmlFor="message" className="block text-sm font-medium mb-2">
          Message *
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleInputChange}
          required
          rows={5}
          className="w-full px-4 py-3 bg-surface border border-white/20 rounded-lg focus:border-accent-gold focus:outline-none text-foreground resize-none"
        />
      </div>

      <PrimaryButton
        type="submit"
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? 'Sending...' : 'Send Message'}
      </PrimaryButton>

      {submitStatus === 'success' && (
        <div className="bg-accent-gold/10 border border-accent-gold rounded-lg p-4 text-accent-gold text-center">
          Message sent successfully! We&apos;ll get back to you soon.
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400 text-center">
          Failed to send message. Please try again.
        </div>
      )}
    </form>
  );
}
