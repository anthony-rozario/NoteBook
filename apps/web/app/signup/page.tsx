"use client";
import { useState } from "react";
import { motion } from "framer-motion";

export default function SignupPage() {
  const [role, setRole] = useState("student");

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFCF0]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-gray-100"
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h2>
        <p className="text-gray-500 mb-8">Join the NoteBook collaborative ecosystem.</p>

        <form className="space-y-4">
          {/* Role Selection Toggle */}
          <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => setRole("student")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                role === "student" ? "bg-white shadow-sm text-black" : "text-gray-500"
              }`}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => setRole("professional")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                role === "professional" ? "bg-white shadow-sm text-black" : "text-gray-500"
              }`}
            >
              Professional
            </button>
          </div>

          <input type="text" placeholder="Full Name" className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 outline-none" />
          <input type="email" placeholder="Email Address" className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 outline-none" />
          <input type="password" placeholder="Password" className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 outline-none" />

          <button className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-amber-200">
            Sign Up as {role === "student" ? "a Student" : "a Professional"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}