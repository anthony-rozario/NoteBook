'use client';

import React, { useEffect, useRef, useState } from 'react';
import Footer from '@/components/Footer';
import AuthModal from '@/app/auth/AuthModal';
import Icon from '@/components/ui/AppIcon';

interface FormState {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const contactMethods = [
  {
    icon: 'EnvelopeIcon',
    title: 'Email us',
    description: 'Our team typically replies within 24 hours.',
    value: 'hello@notebook.app',
    href: 'mailto:hello@notebook.app',
  },
  {
    icon: 'ChatBubbleLeftRightIcon',
    title: 'Live chat',
    description: 'Available Mon–Fri, 9am–6pm EST.',
    value: 'Start a conversation',
    href: '#',
  },
  {
    icon: 'MapPinIcon',
    title: 'Office',
    description: 'Come say hello at our HQ.',
    value: '340 Pine St, San Francisco, CA',
    href: '#',
  },
];

export default function ContactPage() {
  const [form, setForm] = useState<FormState>({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'login' | 'signup'>('signup');
  const sectionRef = useRef<HTMLDivElement>(null);

  const openModal = (mode: 'login' | 'signup') => {
    setModalMode(mode);
    setModalOpen(true);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('active');
        });
      },
      { threshold: 0.06, rootMargin: '0px 0px -40px 0px' }
    );
    const els = sectionRef.current?.querySelectorAll('.reveal');
    els?.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1200);
  };

  return (
    <>

      <main ref={sectionRef} className="pt-28 pb-24 px-5 bg-nb-bg min-h-screen">
        <div className="max-w-6xl mx-auto">

          {/* Hero */}
          <div className="text-center mb-16">
            <div className="reveal inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-nb-primary mb-3">
              <span className="w-4 h-px bg-nb-primary inline-block" aria-hidden="true" />
              Contact
              <span className="w-4 h-px bg-nb-primary inline-block" aria-hidden="true" />
            </div>
            <h1
              className="reveal reveal-delay-1 font-bold tracking-tight leading-[1.1] mb-4 text-nb-foreground"
              style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)' }}
            >
              We&apos;d love to{' '}
              <span className="ai-shimmer">hear from you.</span>
            </h1>
            <p className="reveal reveal-delay-2 text-nb-muted text-lg max-w-xl mx-auto leading-relaxed">
              Have a question, feedback, or just want to say hi? Our team is here to help.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Contact Methods */}
            <div className="lg:col-span-1 space-y-4">
              {contactMethods.map((method, i) => (
                <a
                  key={method.title}
                  href={method.href}
                  className={`reveal reveal-delay-${i + 1} flex items-start gap-4 p-5 bg-white rounded-2xl border border-nb-border/60 hover:border-nb-primary/30 hover:shadow-nb-md transition-all duration-200 group block`}
                >
                  <div className="w-11 h-11 rounded-xl bg-nb-bg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-50 transition-colors duration-200">
                    <Icon name={method.icon as 'EnvelopeIcon'} size={20} className="text-nb-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-nb-foreground text-sm mb-0.5">{method.title}</p>
                    <p className="text-nb-muted text-xs mb-1.5 leading-relaxed">{method.description}</p>
                    <p className="text-nb-primary text-sm font-medium">{method.value}</p>
                  </div>
                </a>
              ))}

              {/* Social */}
              <div className="reveal reveal-delay-4 p-5 bg-white rounded-2xl border border-nb-border/60">
                <p className="font-semibold text-nb-foreground text-sm mb-3">Follow us</p>
                <div className="flex items-center gap-2">
                  {[
                    { label: 'Twitter', icon: 'ChatBubbleLeftIcon' },
                    { label: 'GitHub', icon: 'CodeBracketIcon' },
                    { label: 'LinkedIn', icon: 'BuildingOfficeIcon' },
                  ].map((social) => (
                    <a
                      key={social.label}
                      href="#"
                      aria-label={`NoteBook on ${social.label}`}
                      className="w-9 h-9 rounded-lg border border-nb-border flex items-center justify-center text-nb-muted hover:text-nb-primary hover:border-nb-primary/40 transition-all duration-200"
                    >
                      <Icon name={social.icon as 'CodeBracketIcon'} size={16} />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="reveal reveal-delay-2 bg-white rounded-3xl border border-nb-border/60 p-8 shadow-nb-sm">
                {submitted ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-5">
                      <Icon name="CheckIcon" size={28} className="text-green-500" />
                    </div>
                    <h2 className="text-xl font-bold text-nb-foreground mb-2">Message sent!</h2>
                    <p className="text-nb-muted text-sm max-w-xs leading-relaxed">
                      Thanks for reaching out. We&apos;ll get back to you within 24 hours.
                    </p>
                    <button
                      onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
                      className="mt-7 px-6 py-2.5 bg-nb-primary text-white text-sm font-semibold rounded-xl hover:bg-nb-primary-dark transition-colors"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} noValidate>
                    <h2 className="text-lg font-bold text-nb-foreground mb-6">Send us a message</h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label htmlFor="name" className="block text-xs font-semibold text-nb-foreground mb-1.5">
                          Full name <span className="text-red-400">*</span>
                        </label>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          required
                          value={form.name}
                          onChange={handleChange}
                          placeholder="Jane Smith"
                          className="w-full px-4 py-3 rounded-xl border border-nb-border bg-nb-bg text-nb-foreground text-sm placeholder:text-nb-muted/60 focus:outline-none focus:border-nb-primary focus:ring-2 focus:ring-nb-primary/10 transition-all"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-xs font-semibold text-nb-foreground mb-1.5">
                          Email address <span className="text-red-400">*</span>
                        </label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={form.email}
                          onChange={handleChange}
                          placeholder="jane@example.com"
                          className="w-full px-4 py-3 rounded-xl border border-nb-border bg-nb-bg text-nb-foreground text-sm placeholder:text-nb-muted/60 focus:outline-none focus:border-nb-primary focus:ring-2 focus:ring-nb-primary/10 transition-all"
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label htmlFor="subject" className="block text-xs font-semibold text-nb-foreground mb-1.5">
                        Subject <span className="text-red-400">*</span>
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        required
                        value={form.subject}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-nb-border bg-nb-bg text-nb-foreground text-sm focus:outline-none focus:border-nb-primary focus:ring-2 focus:ring-nb-primary/10 transition-all appearance-none"
                      >
                        <option value="" disabled>Select a topic…</option>
                        <option value="general">General inquiry</option>
                        <option value="billing">Billing & plans</option>
                        <option value="technical">Technical support</option>
                        <option value="sales">Sales & enterprise</option>
                        <option value="feedback">Product feedback</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="mb-6">
                      <label htmlFor="message" className="block text-xs font-semibold text-nb-foreground mb-1.5">
                        Message <span className="text-red-400">*</span>
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        rows={5}
                        value={form.message}
                        onChange={handleChange}
                        placeholder="Tell us how we can help…"
                        className="w-full px-4 py-3 rounded-xl border border-nb-border bg-nb-bg text-nb-foreground text-sm placeholder:text-nb-muted/60 focus:outline-none focus:border-nb-primary focus:ring-2 focus:ring-nb-primary/10 transition-all resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 rounded-2xl text-sm font-bold text-white transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70"
                      style={{ background: 'linear-gradient(135deg, #1B4FD8 0%, #3B6EF0 100%)' }}
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                          Sending…
                        </>
                      ) : (
                        <>
                          Send message
                          <Icon name="PaperAirplaneIcon" size={16} />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <AuthModal
        isOpen={modalOpen}
        initialView={modalMode}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
