'use client';

import React, { useEffect, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';

interface CtaSectionProps {
  onOpenModal?: (mode: 'login' | 'signup') => void;
}

export default function CtaSection({ onOpenModal }: CtaSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('active');
        });
      },
      { threshold: 0.1 }
    );
    const els = sectionRef.current?.querySelectorAll('.reveal');
    els?.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-24 px-5 bg-white relative overflow-hidden"
      aria-labelledby="cta-heading"
    >
      <div className="max-w-4xl mx-auto relative z-10">
        <div
          className="reveal rounded-4xl p-12 md:p-16 text-center relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #1B4FD8 0%, #3B6EF0 50%, #6366F1 100%)',
          }}
        >
          {/* Background orbs */}
          <div
            className="absolute top-[-30%] left-[-10%] w-[400px] h-[400px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 60%)' }}
            aria-hidden="true"
          />
          <div
            className="absolute bottom-[-20%] right-[-5%] w-[300px] h-[300px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 60%)' }}
            aria-hidden="true"
          />

          {/* Noise overlay */}
          <div className="noise absolute inset-0 rounded-4xl pointer-events-none" aria-hidden="true" />

          <div className="relative z-10">
            {/* Badge */}
            <div className="reveal inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 border border-white/25 text-sm font-semibold text-white mb-8">
              <span
                className="w-1.5 h-1.5 rounded-full bg-green-400"
                style={{ animation: 'pulse-dot 2s ease-in-out infinite' }}
                aria-hidden="true"
              />
              Free forever — no credit card needed
            </div>

            <h2
              id="cta-heading"
              className="reveal reveal-delay-1 font-bold tracking-tight leading-[1.1] text-white mb-5"
              style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
            >
              Start thinking smarter
              <br />
              today.
            </h2>

            <p className="reveal reveal-delay-2 text-blue-100 text-lg max-w-xl mx-auto leading-relaxed mb-10">
              Join 24,000+ students, researchers, and professionals who use NoteBook to capture, connect, and create.
            </p>

            {/* CTAs */}
            <div className="reveal reveal-delay-3 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => onOpenModal?.('signup')}
                className="group w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl text-base font-bold text-nb-primary bg-white hover:bg-blue-50 transition-all duration-300 hover:shadow-nb-lg hover:scale-105 active:scale-95"
              >
                Get started for free
                <Icon
                  name="ArrowRightIcon"
                  size={18}
                  className="transition-transform group-hover:translate-x-1 duration-200"
                />
              </button>
              <button
                onClick={() => onOpenModal?.('login')}
                className="group w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl text-base font-semibold text-white border border-white/30 hover:bg-white/10 transition-all duration-300"
              >
                Sign in
              </button>
            </div>

            {/* Trust badges */}
            <div className="reveal reveal-delay-4 flex flex-wrap items-center justify-center gap-6 mt-10">
              {[
                { icon: 'ShieldCheckIcon', label: 'End-to-end encrypted' },
                { icon: 'BoltIcon', label: 'No setup required' },
                { icon: 'ArrowPathIcon', label: 'Cancel anytime' },
              ].map((badge) => (
                <div key={badge.label} className="flex items-center gap-2 text-blue-100 text-sm font-medium">
                  <Icon name={badge.icon as 'ShieldCheckIcon'} size={16} className="text-blue-200" />
                  {badge.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
