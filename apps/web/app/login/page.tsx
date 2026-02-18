"use client";
import { motion } from "framer-motion";
import { login } from "@/app/auth/actions";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFCF0] p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-gray-100"
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h2>
        <p className="text-gray-500 mb-8">Log in to access your NoteBook workspace.</p>

        <form action={login} className="space-y-4">
          <div className="space-y-4">
            <input 
              name="email" 
              type="email" 
              placeholder="Email Address" 
              required 
              className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-amber-500" 
            />
            <input 
              name="password" 
              type="password" 
              placeholder="Password" 
              required 
              className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-amber-500" 
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-black text-white font-bold py-3 rounded-xl shadow-lg hover:bg-gray-800 transition-all mt-4"
          >
            Sign In
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <Link href="/signup" className="text-amber-600 font-semibold hover:underline">
            Create one for free
          </Link>
        </div>
      </motion.div>
    </div>
  );
}