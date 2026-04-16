'use client';

import React, { useEffect, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';

interface Feature {
  icon: string;
  label: string;
  title: string;
  description: string;
  stat?: string;
  statLabel?: string;
  accent: string;
  accentLight: string;
  colSpan: string;
  snippet?: string;
}

const features: Feature[] = [
  {
    icon: 'BookOpenIcon',
    label: 'Organization',
    title: 'Smart Notebooks',
    description:
      'Auto-organize your notes with AI tagging, nested folders, and semantic search that finds what you mean — not just what you type.',
    stat: '3×',
    statLabel: 'faster retrieval',
    accent: '#1B4FD8',
    accentLight: '#EEF2FF',
    colSpan: 'md:col-span-2',
    snippet: '> search("quantum entanglement notes")',
  },
  {
    icon: 'SparklesIcon',
    label: 'Intelligence',
    title: 'AI Assistant',
    description:
      'Ask questions across all your notes. Get summaries, surface connections, and draft new content — trained on your own knowledge base.',
    stat: '94%',
    statLabel: 'accuracy on user notes',
    accent: '#6366F1',
    accentLight: '#EEF2FF',
    colSpan: 'md:col-span-2',
  },
  {
    icon: 'ArrowPathIcon',
    label: 'Collaboration',
    title: 'Real-time Sync',
    description:
      'Every keystroke syncs across all your devices and collaborators in under 200ms. Work together without stepping on each other.',
    accent: '#0EA5E9',
    accentLight: '#F0F9FF',
    colSpan: 'md:col-span-1',
  },
  {
    icon: 'BoltIcon',
    label: 'Performance',
    title: 'Lightning Fast',
    description:
      'Opens in 0.4 seconds. Search returns in 80ms. Built on a custom CRDT engine — no lag, no spinners.',
    stat: '80ms',
    statLabel: 'search latency',
    accent: '#F59E0B',
    accentLight: '#FFFBEB',
    colSpan: 'md:col-span-1',
  },
  {
    icon: 'ShieldCheckIcon',
    label: 'Security',
    title: 'Secure Storage',
    description:
      'End-to-end encrypted by default. Your notes are yours — zero-knowledge architecture means even we can\'t read them.',
    stat: 'E2EE',
    statLabel: 'zero-knowledge',
    accent: '#10B981',
    accentLight: '#ECFDF5',
    colSpan: 'md:col-span-2',
  },
];

// Smart Alerts is full-width row
const alertFeature: Feature = {
  icon: 'BellAlertIcon',
  label: 'Productivity',
  title: 'Smart Alerts',
  description:
    'NoteBook watches your deadlines, meeting notes, and action items. It surfaces what needs your attention before you forget — not after.',
  accent: '#EC4899',
  accentLight: '#FDF2F8',
  colSpan: 'md:col-span-4',
};

export default function FeaturesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
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
      id="features"
      ref={sectionRef}
      className="py-20 px-5 bg-white relative"
      aria-labelledby="features-heading"
    >
      {/* Section header */}
      <div className="max-w-7xl mx-auto mb-14">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div className="reveal">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-nb-primary mb-3">
              <span className="w-4 h-px bg-nb-primary inline-block" aria-hidden="true" />
              Everything you need
            </span>
            <h2
              id="features-heading"
              className="font-bold tracking-tight leading-[1.1]"
              style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
            >
              Built for how you{' '}
              <span className="ai-shimmer">actually think.</span>
            </h2>
          </div>
          <p className="reveal reveal-delay-1 text-base text-nb-muted max-w-sm leading-relaxed lg:text-right">
            Six core capabilities that turn scattered thoughts into structured, searchable, shareable knowledge.
          </p>
        </div>
      </div>

      {/* Bento grid */}
      {/* 
        Row audit (4-col grid):
        Row 1: Smart Notebooks (col-span-2) + AI Assistant (col-span-2) = 4/4 ✓
        Row 2: Real-time Sync (col-span-1) + Lightning Fast (col-span-1) + Secure Storage (col-span-2) = 4/4 ✓
        Row 3: Smart Alerts (col-span-4) = 4/4 ✓
      */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4">
        {features.map((feature, index) => (
          <div
            key={feature.title}
            className={`reveal reveal-delay-${Math.min(index + 1, 5)} bento-card ${feature.colSpan} rounded-3xl p-7 border border-nb-border/60 relative overflow-hidden group`}
            style={{ background: feature.accentLight }}
          >
            {/* Icon badge */}
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
              style={{ background: feature.accent }}
              aria-hidden="true"
            >
              <Icon name={feature.icon as 'BookOpenIcon'} size={20} className="text-white" />
            </div>

            <span
              className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 block"
              style={{ color: feature.accent }}
            >
              {feature.label}
            </span>
            <h3 className="text-xl font-bold text-nb-foreground mb-2.5">{feature.title}</h3>
            <p className="text-sm text-nb-muted leading-relaxed mb-4">{feature.description}</p>

            {/* Code snippet for Smart Notebooks */}
            {feature.snippet && (
              <div className="rounded-xl bg-nb-foreground/5 border border-nb-border/60 px-3 py-2 mb-4">
                <code className="text-xs font-mono text-nb-foreground/70">{feature.snippet}</code>
              </div>
            )}

            {/* Stat badge */}
            {feature.stat && (
              <div className="inline-flex items-baseline gap-1.5 mt-auto">
                <span
                  className="text-3xl font-black"
                  style={{ color: feature.accent }}
                >
                  {feature.stat}
                </span>
                <span className="text-xs font-semibold text-nb-muted">{feature.statLabel}</span>
              </div>
            )}

            {/* Decorative corner shape */}
            <div
              className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full opacity-10 pointer-events-none transition-all duration-500 group-hover:opacity-20 group-hover:scale-125"
              style={{ background: feature.accent }}
              aria-hidden="true"
            />
          </div>
        ))}

        {/* Smart Alerts — full-width row */}
        <div
          className={`reveal reveal-delay-5 bento-card ${alertFeature.colSpan} rounded-3xl border border-nb-border/60 relative overflow-hidden group`}
          style={{ background: alertFeature.accentLight }}
        >
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 p-7">
            <div className="flex-shrink-0">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                style={{ background: alertFeature.accent }}
                aria-hidden="true"
              >
                <Icon name="BellAlertIcon" size={24} className="text-white" />
              </div>
            </div>
            <div className="flex-1">
              <span
                className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 block"
                style={{ color: alertFeature.accent }}
              >
                {alertFeature.label}
              </span>
              <h3 className="text-xl font-bold text-nb-foreground mb-1.5">{alertFeature.title}</h3>
              <p className="text-sm text-nb-muted leading-relaxed max-w-2xl">{alertFeature.description}</p>
            </div>

            {/* Alert preview chips */}
            <div className="flex-shrink-0 flex flex-col gap-2 w-full md:w-auto">
              {[
                { label: 'Paper deadline · in 2 days', color: '#EC4899' },
                { label: 'Follow up with Prof. Chen', color: '#F59E0B' },
                { label: 'Review meeting notes', color: '#1B4FD8' },
              ].map((alert, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 px-3 py-2 bg-white rounded-xl border border-nb-border/60 shadow-nb-sm text-xs font-semibold text-nb-foreground whitespace-nowrap"
                >
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: alert.color }}
                    aria-hidden="true"
                  />
                  {alert.label}
                </div>
              ))}
            </div>
          </div>

          {/* Decorative */}
          <div
            className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full opacity-10 pointer-events-none transition-all duration-500 group-hover:opacity-20"
            style={{ background: alertFeature.accent }}
            aria-hidden="true"
          />
        </div>
      </div>
    </section>
  );
}