"use client";
import Link from "next/link";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { TypewriterEffect } from "@/components/ui/typewriter-effect";
import { CyclingTypewriterWithErase } from "@/components/ui/cycling-typewriter-with-erase";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function Home() {
  const textOptions = [
    [
      {
        text: "Revolutionizing",
        className: "text-white",
      },
      {
        text: "Attendance",
        className: "text-white",
      },
      {
        text: "and",
        className: "text-white",
      },
      {
        text: "Check-in",
        className: "text-white",
      },
    ],
    [
      {
        text: "Managing",
        className: "text-white",
      },
      {
        text: "students",
        className: "text-white",
      },
      {
        text: "got",
        className: "text-white",
      },
      {
        text: "a",
        className: "text-white",
      },
      {
        text: "lot",
        className: "text-white",
      },
      {
        text: "easier",
        className: "text-white",
      },
    ]
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
          <CyclingTypewriterWithErase 
            textOptions={textOptions} 
            className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4"
            typeSpeed={80}
            eraseSpeed={40}
            waitTime={1500}
          />
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
            cursorClassName="hidden"
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
          className="flex flex-col md:flex-row space-y-4 md:space-y-0 space-x-0 md:space-x-6"
        >
          <Link href="/auth/register?role=student">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-48 h-14 rounded-full bg-black text-white text-lg font-semibold transition-all duration-200 shadow-lg"
            >
              Student
            </motion.button>
          </Link>
          <Link href="/teacher/dashboard">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-48 h-14 rounded-full bg-white text-black text-lg font-semibold transition-all duration-200 shadow-lg"
            >
              Teacher
            </motion.button>
          </Link>
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
