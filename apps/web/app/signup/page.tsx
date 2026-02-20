"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { signUp } from "@/app/auth/actions";

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("student");

  // Navigation handlers with explicit preventDefault to stop the "1-second reset"
  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    setStep((s) => s + 1);
  };

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    setStep((s) => s - 1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFCF0] p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-gray-100"
      >
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex justify-between mb-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`h-1.5 w-full mx-1 rounded-full transition-all duration-500 ${step >= i ? "bg-amber-500" : "bg-gray-200"}`} />
            ))}
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            {step === 1 && "Personal Info"}
            {step === 2 && "Choose Your Path"}
            {step === 3 && (role === "student" ? "Academic Details" : "Work Details")}
          </h2>
          <p className="text-sm text-gray-500 mt-1">Step {step} of 3</p>
        </div>

        <form action={signUp} className="space-y-4">
          
          {/* STAGE 1: Personal Info - Always in DOM but hidden if step != 1 */}
          <div className={step === 1 ? "block space-y-4" : "hidden"}>
            <input name="full_name" type="text" placeholder="Full Name" required={step === 1} className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-amber-500" />
            <input name="email" type="email" placeholder="Email Address" required={step === 1} className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-amber-500" />
            <input name="password" type="password" placeholder="Password" required={step === 1} className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-amber-500" />
            <input name="phone" type="tel" placeholder="Phone Number" required={step === 1} className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-amber-500" />
          </div>

          {/* STAGE 2: Role Selection */}
          <div className={step === 2 ? "block space-y-4" : "hidden"}>
            <input type="hidden" name="user_type" value={role} />
            <div className="grid grid-cols-1 gap-3">
              <button 
                type="button" 
                onClick={() => setRole("student")}
                className={`p-4 rounded-xl border-2 text-left transition-all ${role === "student" ? "border-amber-500 bg-amber-50" : "border-gray-100 hover:border-gray-200"}`}
              >
                <span className="block font-bold text-gray-800">🎓 Student</span>
                <span className="text-xs text-gray-500">I want to organize my college notes.</span>
              </button>
              <button 
                type="button" 
                onClick={() => setRole("professional")}
                className={`p-4 rounded-xl border-2 text-left transition-all ${role === "professional" ? "border-amber-500 bg-amber-50" : "border-gray-100 hover:border-gray-200"}`}
              >
                <span className="block font-bold text-gray-800">💼 Professional</span>
                <span className="text-xs text-gray-500">I'm managing Rozaa Tech Solutions projects.</span>
              </button>
            </div>
          </div>

          {/* STAGE 3: Contextual Details */}
          <div className={step === 3 ? "block space-y-4" : "hidden"}>
            {role === "student" ? (
              <>
                <input name="institution" type="text" placeholder="College/School Name (e.g. KIIT)" required={step === 3 && role === "student"} className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-amber-500" />
                <input name="course" type="text" placeholder="Course/Class (e.g. MCA)" required={step === 3 && role === "student"} className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-amber-500" />
              </>
            ) : (
              <>
                <input name="profession" type="text" placeholder="Your Profession" required={step === 3 && role === "professional"} className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-amber-500" />
                <input name="company" type="text" placeholder="Company Name" required={step === 3 && role === "professional"} className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-amber-500" />
              </>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-3 pt-6">
            {step > 1 && (
              <button 
                type="button" 
                onClick={handleBack} 
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-600 font-semibold rounded-xl hover:bg-gray-200 transition-all"
              >
                Back
              </button>
            )}
            
            {step < 3 ? (
              <button 
                type="button" 
                onClick={handleNext} 
                className="flex-2 px-4 py-3 bg-amber-500 text-white font-bold rounded-xl shadow-lg shadow-amber-100 hover:bg-amber-600 transition-all"
              >
                Continue
              </button>
            ) : (
              <button 
                type="submit" 
                className="flex-2 px-4 py-3 bg-black text-white font-bold rounded-xl shadow-lg hover:bg-gray-800 transition-all"
              >
                Complete Setup
              </button>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
}