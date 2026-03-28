"use client"

import { motion } from "framer-motion"

export default function Page({ children }: any) {

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative w-[816px] h-[1056px] bg-white 
      shadow-[0_0_15px_rgba(0,0,0,0.2)] ring-1 ring-gray-200"
    >

      <div className="absolute inset-0 p-[96px]">
        {children}
      </div>

    </motion.div>
  )
}