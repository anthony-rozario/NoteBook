'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Footer from '@/components/Footer';
import AuthModal from '@/app/auth/AuthModal';
import Icon from '@/components/ui/AppIcon';

interface PricingTier {
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  description: string;
  features: string[];
  cta: string;
  highlighted: boolean;
  badge?: string;
}

const tiers: PricingTier[] = [
  {
    name: 'Free',
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: 'Perfect for personal use and getting started.',
    features: [
      'Up to 50 notes',
      '1 GB storage',
      'Basic AI summaries (10/month)',
      'Web & mobile access',
      'Community support',
    ],
    cta: 'Get started free',
    highlighted: false,
  },
  {
    name: 'Pro',
    monthlyPrice: 12,
    yearlyPrice: 9,
    description: 'For power users who want unlimited AI and storage.',
    features: [
      'Unlimited notes',
      '50 GB storage',
      'Unlimited AI queries',
      'AI quiz & flashcard generator',
      'Smart Alerts',
      'Priority support',
      'Version history (90 days)',
    ],
    cta: 'Start Pro free trial',
    highlighted: true,
    badge: 'Most popular',
  },
  {
    name: 'Team',
    monthlyPrice: 28,
    yearlyPrice: 22,
    description: 'Built for teams that need collaboration and admin controls.',
    features: [
      'Everything in Pro',
      'Unlimited members',
      '500 GB shared storage',
      'Real-time collaboration',
      'Admin dashboard',
      'SSO & SAML',
      'Dedicated account manager',
    ],
    cta: 'Contact sales',
    highlighted: false,
  },
];

const faqs = [
  {
    question: 'Can I switch plans at any time?',
    answer: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately and we\'ll prorate any billing differences.',
  },
  {
    question: 'Is there a free trial for paid plans?',
    answer: 'Absolutely. The Pro plan comes with a 14-day free trial — no credit card required. You can explore all features before committing.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, Mastercard, Amex), PayPal, and bank transfers for annual Team plans.',
  },
  {
    question: 'What happens to my data if I downgrade?',
    answer: 'Your data is always safe. If you exceed the free tier limits after downgrading, your existing notes are preserved in read-only mode until you upgrade again.',
  },
  {
    question: 'Do you offer discounts for students or nonprofits?',
    answer: 'Yes! We offer 50% off for verified students and nonprofits. Reach out to our support team with proof of eligibility.',
  },
  {
    question: 'Is there a limit on team members for the Team plan?',
    answer: 'No limits. The Team plan supports unlimited members. Pricing is per workspace, not per seat.',
  },
];

export default function PricingPage() {
  const [yearly, setYearly] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
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

  return (
    <>

      <main ref={sectionRef} className="pt-28 pb-24 px-5 bg-nb-bg min-h-screen">
        <div className="max-w-7xl mx-auto">

          {/* Hero */}
          <div className="text-center mb-14">
            <div className="reveal inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-nb-primary mb-3">
              <span className="w-4 h-px bg-nb-primary inline-block" aria-hidden="true" />
              Pricing
              <span className="w-4 h-px bg-nb-primary inline-block" aria-hidden="true" />
            </div>
            <h1
              className="reveal reveal-delay-1 font-bold tracking-tight leading-[1.1] mb-4 text-nb-foreground"
              style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)' }}
            >
              Simple, transparent{' '}
              <span className="ai-shimmer">pricing.</span>
            </h1>
            <p className="reveal reveal-delay-2 text-nb-muted text-lg max-w-xl mx-auto leading-relaxed mb-8">
              Start free. Upgrade when you need more. No hidden fees, no surprises.
            </p>

            {/* Billing toggle */}
            <div className="reveal reveal-delay-3 inline-flex items-center gap-3 p-1 rounded-full bg-white border border-nb-border shadow-nb-sm">
              <button
                onClick={() => setYearly(false)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  !yearly ? 'bg-nb-primary text-white shadow-nb-sm' : 'text-nb-muted hover:text-nb-foreground'
                }`}
                aria-pressed={!yearly}
              >
                Monthly
              </button>
              <button
                onClick={() => setYearly(true)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                  yearly ? 'bg-nb-primary text-white shadow-nb-sm' : 'text-nb-muted hover:text-nb-foreground'
                }`}
                aria-pressed={yearly}
              >
                Yearly
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full transition-all ${
                    yearly ? 'bg-white/20 text-white' : 'bg-green-100 text-green-700'
                  }`}
                >
                  Save 25%
                </span>
              </button>
            </div>
          </div>

          {/* Tiers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start mb-24">
            {tiers.map((tier, i) => (
              <div
                key={tier.name}
                className={`reveal reveal-delay-${i + 1} relative rounded-3xl p-8 border transition-all duration-300 ${
                  tier.highlighted
                    ? 'border-nb-primary bg-nb-primary shadow-nb-xl scale-[1.02]'
                    : 'border-nb-border/60 bg-white hover:-translate-y-1 hover:shadow-nb-md'
                }`}
              >
                {tier.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-400 text-amber-900 shadow-sm whitespace-nowrap">
                      <Icon name="StarIcon" size={11} />
                      {tier.badge}
                    </span>
                  </div>
                )}

                <p className={`text-xs font-black uppercase tracking-[0.2em] mb-2 ${tier.highlighted ? 'text-blue-200' : 'text-nb-muted'}`}>
                  {tier.name}
                </p>

                <div className="flex items-baseline gap-1 mb-2">
                  <span className={`text-5xl font-black ${tier.highlighted ? 'text-white' : 'text-nb-foreground'}`}>
                    ${yearly ? tier.yearlyPrice : tier.monthlyPrice}
                  </span>
                  {tier.monthlyPrice > 0 && (
                    <span className={`text-sm font-medium ${tier.highlighted ? 'text-blue-200' : 'text-nb-muted'}`}>
                      / mo
                    </span>
                  )}
                </div>
                {yearly && tier.monthlyPrice > 0 && (
                  <p className={`text-xs mb-4 ${tier.highlighted ? 'text-blue-200' : 'text-nb-muted'}`}>
                    Billed ${tier.yearlyPrice * 12}/year
                  </p>
                )}

                <p className={`text-sm leading-relaxed mb-7 ${tier.highlighted ? 'text-blue-100' : 'text-nb-muted'}`}>
                  {tier.description}
                </p>

                <button
                  onClick={() => openModal('signup')}
                  className={`w-full py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 mb-7 ${
                    tier.highlighted
                      ? 'bg-white text-nb-primary hover:bg-blue-50 shadow-nb-sm'
                      : 'bg-nb-primary text-white hover:bg-nb-primary-dark shadow-nb-sm hover:shadow-nb-md'
                  }`}
                >
                  {tier.cta}
                </button>

                <div className={`h-px mb-6 ${tier.highlighted ? 'bg-white/20' : 'bg-nb-border/60'}`} aria-hidden="true" />

                <ul className="space-y-3" aria-label={`${tier.name} plan features`}>
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          tier.highlighted ? 'bg-white/20' : 'bg-nb-bg'
                        }`}
                        aria-hidden="true"
                      >
                        <Icon name="CheckIcon" size={11} className={tier.highlighted ? 'text-white' : 'text-nb-primary'} />
                      </div>
                      <span className={`text-sm leading-relaxed ${tier.highlighted ? 'text-blue-50' : 'text-nb-muted'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* FAQ */}
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="reveal font-bold text-nb-foreground mb-3" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.25rem)' }}>
                Frequently asked questions
              </h2>
              <p className="reveal reveal-delay-1 text-nb-muted text-base">
                Can&apos;t find the answer you&apos;re looking for?{' '}
                <Link href="/contact" className="text-nb-primary font-semibold hover:underline">
                  Contact our team
                </Link>
              </p>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div
                  key={i}
                  className={`reveal reveal-delay-${(i % 3) + 1} bg-white rounded-2xl border border-nb-border/60 overflow-hidden transition-all duration-200`}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-6 py-5 text-left"
                    aria-expanded={openFaq === i}
                  >
                    <span className="font-semibold text-nb-foreground text-sm">{faq.question}</span>
                    <div className={`w-6 h-6 rounded-full bg-nb-bg flex items-center justify-center flex-shrink-0 ml-4 transition-transform duration-200 ${openFaq === i ? 'rotate-45' : ''}`}>
                      <Icon name="PlusIcon" size={14} className="text-nb-primary" />
                    </div>
                  </button>
                  {openFaq === i && (
                    <div className="px-6 pb-5">
                      <p className="text-nb-muted text-sm leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="reveal mt-20 rounded-3xl p-10 text-center overflow-hidden relative" style={{ background: 'linear-gradient(135deg, #1B4FD8 0%, #3B6EF0 100%)' }}>
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} aria-hidden="true" />
            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Still not sure? Start free.</h2>
              <p className="text-blue-100 mb-7 max-w-md mx-auto">No credit card required. Upgrade anytime. Cancel whenever you want.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => openModal('signup')}
                  className="px-7 py-3.5 bg-white text-nb-primary font-bold rounded-2xl hover:bg-blue-50 transition-all duration-200 shadow-nb-sm text-sm"
                >
                  Get started free
                </button>
                <Link
                  href="/contact"
                  className="px-7 py-3.5 bg-white/10 text-white font-semibold rounded-2xl hover:bg-white/20 transition-all duration-200 text-sm border border-white/20"
                >
                  Talk to sales
                </Link>
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
