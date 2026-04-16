'use client';

import React, { useEffect, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';

const steps = [
  {
    step: '01',
    icon: 'UserPlusIcon',
    title: 'Create your workspace',
    description:
      'Sign up in seconds and set up your personal or team workspace. Import existing notes from Notion, Obsidian, or plain text — we handle the migration.',
    accent: '#1B4FD8',
    accentLight: '#EEF2FF',
    tag: 'Setup in < 2 min',
  },
  {
    step: '02',
    icon: 'PencilSquareIcon',
    title: 'Capture & organize',
    description:
      'Write freely with rich text, code blocks, math equations, and embeds. NoteBook auto-tags and links related notes as you type.',
    accent: '#6366F1',
    accentLight: '#F5F3FF',
    tag: 'AI tagging included',
  },
  {
    step: '03',
    icon: 'SparklesIcon',
    title: 'Ask, learn, and share',
    description:
      'Query your entire knowledge base with natural language. Generate summaries, flashcards, and quizzes — then share with one click.',
    accent: '#0EA5E9',
    accentLight: '#F0F9FF',
    tag: 'Powered by AI',
  },
];

export default function HowItWorksSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('active');
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );
    const els = sectionRef.current?.querySelectorAll('.reveal');
    els?.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="py-24 px-5 bg-nb-bg relative overflow-hidden"
      aria-labelledby="how-heading"
    >
      {/* Background decoration */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full pointer-events-none opacity-40"
        style={{ background: 'radial-gradient(ellipse, rgba(27,79,216,0.08) 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="reveal inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-nb-primary mb-3">
            <span className="w-4 h-px bg-nb-primary inline-block" aria-hidden="true" />
            How it works
            <span className="w-4 h-px bg-nb-primary inline-block" aria-hidden="true" />
          </div>
          <h2
            id="how-heading"
            className="reveal reveal-delay-1 font-bold tracking-tight leading-[1.1] mb-4"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)' }}
          >
            From idea to insight{' '}
            <span className="ai-shimmer">in three steps.</span>
          </h2>
          <p className="reveal reveal-delay-2 text-nb-muted text-lg max-w-xl mx-auto leading-relaxed">
            No steep learning curve. NoteBook fits into your workflow from day one.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Connector line (desktop) */}
          <div
            className="hidden md:block absolute top-14 left-[calc(16.67%+1.5rem)] right-[calc(16.67%+1.5rem)] h-px"
            style={{ background: 'linear-gradient(90deg, #1B4FD8 0%, #6366F1 50%, #0EA5E9 100%)', opacity: 0.25 }}
            aria-hidden="true"
          />

          {steps.map((step, i) => (
            <div
              key={step.step}
              className={`reveal reveal-delay-${i + 1} relative flex flex-col items-start p-8 rounded-3xl border border-nb-border/60 bg-white group hover:-translate-y-1 transition-all duration-300`}
              style={{ boxShadow: '0 2px 16px rgba(27,79,216,0.06)' }}
            >
              {/* Step number */}
              <div className="flex items-center justify-between w-full mb-6">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                  style={{ background: step.accent }}
                  aria-hidden="true"
                >
                  <Icon name={step.icon as 'UserPlusIcon'} size={20} className="text-white" />
                </div>
                <span
                  className="text-5xl font-black opacity-10 select-none"
                  style={{ color: step.accent }}
                  aria-hidden="true"
                >
                  {step.step}
                </span>
              </div>

              {/* Tag */}
              <span
                className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3"
                style={{ background: step.accentLight, color: step.accent }}
              >
                {step.tag}
              </span>

              <h3 className="text-xl font-bold text-nb-foreground mb-3">{step.title}</h3>
              <p className="text-sm text-nb-muted leading-relaxed">{step.description}</p>

              {/* Decorative corner */}
              <div
                className="absolute -bottom-5 -right-5 w-20 h-20 rounded-full opacity-10 pointer-events-none transition-all duration-500 group-hover:opacity-20 group-hover:scale-125"
                style={{ background: step.accent }}
                aria-hidden="true"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
