'use client';

import React, { useEffect, useRef } from 'react';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

interface HeroSectionProps {
  onOpenModal: (mode: 'login' | 'signup') => void;
}

export default function HeroSection({ onOpenModal }: HeroSectionProps) {
  const parallaxRef = useRef<HTMLDivElement>(null);
  const orb1Ref = useRef<HTMLDivElement>(null);
  const orb2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        if (parallaxRef.current) {
          parallaxRef.current.style.transform = `translateY(${scrollY * 0.3}px)`;
        }
        if (orb1Ref.current) {
          orb1Ref.current.style.transform = `translateY(${scrollY * 0.15}px)`;
        }
        if (orb2Ref.current) {
          orb2Ref.current.style.transform = `translateY(${scrollY * 0.08}px)`;
        }
        ticking = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center pt-28 pb-16 px-5 overflow-hidden noise hero-mesh"
      aria-label="Hero section">

      {/* Background orbs */}
      <div
        ref={orb1Ref}
        className="orb-1 absolute top-[-10%] left-[-8%] w-[520px] h-[520px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(96,165,250,0.18) 0%, transparent 70%)' }}
        aria-hidden="true" />

      <div
        ref={orb2Ref}
        className="orb-2 absolute bottom-[5%] right-[-5%] w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(27,79,216,0.13) 0%, transparent 70%)' }}
        aria-hidden="true" />

      <div
        className="orb-3 absolute top-[40%] left-[55%] w-[320px] h-[320px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(129,140,248,0.12) 0%, transparent 70%)' }}
        aria-hidden="true" />


      {/* Content */}
      <div className="relative z-10 max-w-4xl w-full text-center">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-medium mb-8 animate-fade-up"
          style={{
            background: 'rgba(255,255,255,0.7)',
            borderColor: 'rgba(96,165,250,0.35)',
            color: '#1B4FD8',
            animationDelay: '0.05s'
          }}>

          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: '#1B4FD8', animation: 'pulse-dot 2s ease-in-out infinite' }}
            aria-hidden="true" />

          AI-powered notes — now in 2026
        </div>

        {/* H1 */}
        <h1
          className="font-bold leading-[1.05] tracking-tight mb-6 animate-fade-up"
          style={{
            fontSize: 'clamp(2.8rem, 8vw, 6rem)',
            animationDelay: '0.12s'
          }}>

          Your thinking,{' '}
          <span className="ai-shimmer">amplified by AI.</span>
        </h1>

        {/* Sub */}
        <p
          className="text-lg md:text-xl text-nb-muted max-w-2xl mx-auto leading-relaxed mb-10 animate-fade-up"
          style={{ animationDelay: '0.22s' }}>

          NoteBook is the workspace where students, researchers, and professionals
          capture ideas, collaborate live, and get instant AI answers — all in one place.
        </p>

        {/* CTAs */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14 animate-fade-up"
          style={{ animationDelay: '0.32s' }}>

          <button
            onClick={() => onOpenModal('signup')}
            className="group w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl text-base font-bold text-white transition-all duration-300 hover:shadow-nb-lg hover:scale-105 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #1B4FD8 0%, #3B6EF0 100%)' }}>

            Start for free
            <Icon name="ArrowRightIcon" size={18} className="transition-transform group-hover:translate-x-1 duration-200" />
          </button>
          <button
            onClick={() => onOpenModal('login')}
            className="group w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl text-base font-semibold text-nb-foreground border border-nb-border bg-white/70 backdrop-blur-sm hover:bg-white hover:border-nb-accent-soft hover:shadow-nb-sm transition-all duration-300">

            <Icon name="PlayCircleIcon" size={18} className="text-nb-primary" />
            See how it works
          </button>
        </div>

        {/* Social proof strip */}
        <div
          className="flex items-center justify-center gap-2 animate-fade-up"
          style={{ animationDelay: '0.42s' }}>

          <div className="flex -space-x-2.5">
            {[
              'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
              'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100',
              'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100',
              'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=100'].
              map((src, i) =>
                <div key={i} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden shadow-sm">
                  <AppImage src={src} alt={`NoteBook user ${i + 1}`} width={32} height={32} className="w-full h-full object-cover" />
                </div>
              )}
          </div>
          <span className="text-sm text-nb-muted font-medium ml-1">
            Trusted by <span className="text-nb-foreground font-bold">24,000+</span> thinkers
          </span>
        </div>
      </div>

      {/* Product screenshot card */}
      <div
        className="relative z-10 w-full max-w-5xl mx-auto mt-16 animate-fade-up"
        style={{ animationDelay: '0.52s' }}>

        <div className="relative rounded-3xl overflow-hidden shadow-nb-xl border border-white/80 bg-white">
          {/* Browser chrome */}
          <div className="flex items-center gap-1.5 px-4 py-3 bg-nb-bg border-b border-nb-border/60">
            <div className="w-3 h-3 rounded-full bg-red-400/80" aria-hidden="true" />
            <div className="w-3 h-3 rounded-full bg-yellow-400/80" aria-hidden="true" />
            <div className="w-3 h-3 rounded-full bg-green-400/80" aria-hidden="true" />
            <div className="ml-3 flex-1 max-w-xs mx-auto px-3 py-1 rounded-md bg-white border border-nb-border text-xs text-nb-muted text-center font-mono">
              app.notebook.ai
            </div>
          </div>

          {/* App UI mockup */}
          <div className="parallax-layer">
            <AppImage
              src="/dashboard-ss.jpeg"
              alt="NoteBook workspace showing organized notes, AI suggestions, and collaboration features on a clean blue-white interface"
              width={1400}
              height={700}
              priority
              className="w-full object-cover"
              style={{ maxHeight: '460px', objectPosition: 'top center' }} />

            {/* Gradient overlay at bottom */}
            <div
              className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
              style={{ background: 'linear-gradient(to top, rgba(240,244,255,0.9) 0%, transparent 100%)' }}
              aria-hidden="true" />

          </div>

          {/* Floating AI card */}
          <div
            className="float-card absolute bottom-8 right-8 glass rounded-2xl p-4 shadow-nb-lg max-w-[220px] hidden md:block"
            aria-label="AI Assistant preview">

            <div className="flex items-center gap-2 mb-2.5">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #1B4FD8, #60A5FA)' }}
                aria-hidden="true">

                <Icon name="SparklesIcon" size={14} className="text-white" />
              </div>
              <span className="text-xs font-bold text-nb-foreground">AI Assistant</span>
              <span
                className="ml-auto w-1.5 h-1.5 rounded-full bg-green-400"
                style={{ animation: 'pulse-dot 2s ease-in-out infinite' }}
                aria-hidden="true" />

            </div>
            <p className="text-xs text-nb-muted leading-relaxed mb-2.5">
              &ldquo;Summarize my research notes on climate models…&rdquo;
            </p>
            <div className="flex items-center gap-1.5">
              <div className="flex-1 h-1 rounded-full bg-nb-border overflow-hidden">
                <div className="progress-bar h-full w-[72%]" aria-hidden="true" />
              </div>
              <span className="text-[10px] text-nb-muted font-mono">72%</span>
            </div>
          </div>

          {/* Floating sync badge */}
          <div
            className="absolute top-16 left-6 glass rounded-xl px-3 py-2 shadow-nb-md hidden md:flex items-center gap-2"
            aria-label="Real-time sync active">

            <Icon name="BoltIcon" size={14} className="text-nb-primary" />
            <span className="text-xs font-semibold text-nb-foreground">Synced · 2s ago</span>
          </div>
        </div>
      </div>
    </section>);

}