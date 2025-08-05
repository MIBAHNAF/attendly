"use client";
import Link from "next/link";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { TypewriterEffect } from "@/components/ui/typewriter-effect";
import { motion } from "framer-motion";

export default function Home() {
  const words = [
    {
      text: "Revolutionizing",
      className: "text-white",
    },
    {
      text: "Attendance",
      className: "text-blue-400",
    },
    {
      text: "and",
      className: "text-white",
    },
    {
      text: "Check-in",
      className: "text-blue-400",
    },
  ];

  const brandWords = [
    {
      text: "Attendly",
      className: "text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-blue-600",
    },
  ];

  return (
    <AuroraBackground>
      <div className="relative z-10 flex flex-col items-center justify-center px-4 text-center">
        {/* Main Heading */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mb-8"
        >
          <TypewriterEffect words={words} className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4" />
        </motion.div>

        {/* Brand Name */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 2.5 }}
          className="mb-8"
        >
          <TypewriterEffect 
            words={brandWords} 
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold"
          />
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 3.5 }}
          className="text-gray-300 text-lg md:text-xl mb-12 max-w-2xl"
        >
          NFC-powered attendance tracking that&apos;s as simple as a tap. 
          Join the future of classroom management.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 4 }}
          className="flex flex-col md:flex-row space-y-4 md:space-y-0 space-x-0 md:space-x-4"
        >
          <Link href="/auth/login">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-40 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 border border-blue-500 text-white text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
            >
              Sign In
            </motion.button>
          </Link>
          <Link href="/auth/register">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-40 h-12 rounded-xl bg-transparent hover:bg-white/10 text-white border border-white/30 hover:border-white/50 text-sm font-semibold transition-all duration-200 backdrop-blur-sm"
            >
              Get Started
            </motion.button>
          </Link>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 4.5 }}
          className="grid md:grid-cols-3 gap-6 mt-16 max-w-4xl"
        >
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-white/10 backdrop-blur-md p-6 rounded-lg border border-white/20 hover:border-blue-400/50 transition-all duration-300"
          >
            <div className="text-3xl mb-4">📱</div>
            <h3 className="text-lg font-semibold mb-2 text-blue-300">NFC Attendance</h3>
            <p className="text-gray-300 text-sm">Tap to mark attendance with NFC tags</p>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-white/10 backdrop-blur-md p-6 rounded-lg border border-white/20 hover:border-blue-400/50 transition-all duration-300"
          >
            <div className="text-3xl mb-4">🧑‍🏫</div>
            <h3 className="text-lg font-semibold mb-2 text-blue-300">Class Management</h3>
            <p className="text-gray-300 text-sm">Create and manage classes effortlessly</p>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-white/10 backdrop-blur-md p-6 rounded-lg border border-white/20 hover:border-blue-400/50 transition-all duration-300"
          >
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-lg font-semibold mb-2 text-blue-300">Real-time Analytics</h3>
            <p className="text-gray-300 text-sm">Comprehensive attendance insights</p>
          </motion.div>
        </motion.div>

        {/* Status Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 5 }}
          className="mt-12 px-4 py-2 bg-blue-500/20 border border-blue-400/30 rounded-full"
        >
          <span className="text-blue-300 text-sm">🚧 Ready for Development Phase</span>
        </motion.div>
      </div>
    </AuroraBackground>
  );
}
