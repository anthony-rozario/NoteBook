import { FiBookOpen, FiUsers, FiZap, FiShield, FiBell } from "react-icons/fi";
import { BsStars } from "react-icons/bs"; // Perfect for the AI Assistant icon

export default function Features() {
  const features = [
    {
      icon: <FiBookOpen className="text-blue-600 text-xl" />,
      title: "Smart Notebooks",
      description: "Organize infinite pages with nested hierarchies and rich text."
    },
    {
      icon: <FiUsers className="text-blue-600 text-xl" />,
      title: "Real-time Sync",
      description: "Collaborate seamlessly with fine-grained access controls."
    },
    {
      icon: <BsStars className="text-blue-600 text-xl" />,
      title: "AI Assistant",
      description: "Generate summaries, quizzes, and extract key topics instantly."
    },
    {
      icon: <FiZap className="text-blue-600 text-xl" />,
      title: "Lightning Fast",
      description: "Built on modern web tech for a zero-latency experience."
    },
    {
      icon: <FiShield className="text-blue-600 text-xl" />,
      title: "Secure Storage",
      description: "Your intellectual property is encrypted and safely backed up."
    },
    {
      icon: <FiBell className="text-blue-600 text-xl" />,
      title: "Smart Alerts",
      description: "Stay on top of changes and mentions without the noise."
    }
  ];

  return (
    <section id="features" className="py-24 px-4 bg-[#ffffff]">
      <div className="max-w-6xl mx-auto">
        
        {/* Section Headers */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything you need to excel
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Built for students, researchers, and professionals who demand more from their tools.
          </p>
        </div>

        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white p-8 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-shadow duration-300"
            >
              {/* Icon Container (Matches the light blue square in the image) */}
              <div className="w-12 h-12 inline-flex items-center justify-center rounded-xl bg-blue-50 mb-6">
                {feature.icon}
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
              
              <p className="text-gray-500 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}