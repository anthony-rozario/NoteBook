import Link from "next/link";
import { FiBookOpen } from "react-icons/fi"; // Using react-icons as requested

export default function Footer() {
  return (
    <footer className="bg-[#ffffff] border-t border-gray-200 pt-16 pb-12 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
        
        {/* Column 1: Brand & Description */}
        <div className="md:col-span-1">
          <Link href="/" className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
            <FiBookOpen className="text-[#28282B]/90 text-2xl" />
            <span className="font-bold text-xl text-gray-900 tracking-tight">NoteBook</span>
          </Link>
          <p className="text-gray-500 text-sm leading-relaxed pr-4">
            The collaborative workspace for modern academics and professionals.
          </p>
        </div>

        {/* Column 2: Product Links */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-5">Product</h4>
          <ul className="space-y-4 text-sm text-gray-500">
            <li>
              <Link href="#features" className="hover:text-gray-900 transition-colors">Features</Link>
            </li>
            <li>
              <Link href="#pricing" className="hover:text-gray-900 transition-colors">Pricing</Link>
            </li>
            <li>
              <Link href="#ai" className="hover:text-gray-900 transition-colors">AI Capabilities</Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Company Links */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-5">Company</h4>
          <ul className="space-y-4 text-sm text-gray-500">
            <li>
              <Link href="#about" className="hover:text-gray-900 transition-colors">About Us</Link>
            </li>
            <li>
              <Link href="#contact" className="hover:text-gray-900 transition-colors">Contact</Link>
            </li>
          </ul>
        </div>

        {/* Column 4: Legal Links */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-5">Legal</h4>
          <ul className="space-y-4 text-sm text-gray-500">
            <li>
              <Link href="/privacy" className="hover:text-gray-900 transition-colors">Privacy Policy</Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-gray-900 transition-colors">Terms of Service</Link>
            </li>
          </ul>
        </div>

      </div>
    </footer>
  );
}