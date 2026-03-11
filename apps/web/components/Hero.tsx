import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";


interface HeroSectionProps {
  onOpenAuth?: (view: 'login' | 'signup') => void;
}

export default function HeroSection({ onOpenAuth }: HeroSectionProps) {
  return (
    <section className="relative flex flex-col items-center justify-center pt-32 pb-20 px-4 text-center bg-[#ffffff]">
      
      {/* Top Badge */}
      <div className="inline-flex items-center px-4 py-1.5 mb-8 rounded-full bg-blue-50 border border-blue-100">
        <span className="text-sm font-semibold text-[#28282B]/90">The Future of Academic Collaboration</span>
      </div>

      {/* Main Headline */}
      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-6 leading-tight">
        Organize thoughts.<br />
        <span className="text-[#28282B]/90">Empower learning.</span>
      </h1>

      {/* Subheadline */}
      <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-500 mb-10 leading-relaxed">
        NoteBook brings your notes, research, and team together in one 
        intelligent workspace powered by advanced tools.
      </p>

      {/* Call to Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full px-4">
        {/* Primary CTA */}
        <button 
          onClick={() => onOpenAuth?.('signup')}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg"
        >
          Start for free <FaArrowRight size={18} />
        </button>
        
        {/* Secondary CTA */}
        <Link 
          href="#how-it-works" 
          className="flex items-center justify-center px-8 py-3.5 text-base font-medium text-gray-800 bg-transparent border border-gray-300 rounded-full hover:bg-gray-50 transition-all w-full sm:w-auto"
        >
          See how it works
        </Link>
      </div>

    </section>
  );
}