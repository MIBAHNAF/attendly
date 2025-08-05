"use client";
import { cn } from "@/lib/utils";
import { motion, stagger, useAnimate } from "framer-motion";
import { useEffect, useState } from "react";

export const CyclingTypewriter = ({
  wordsArray,
  className,
  cycleDelay = 3000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scope, animate] = useAnimate();
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const startCycle = async () => {
      if (isAnimating) return;
      setIsAnimating(true);

      // Type in current words
      await animate(
        "span",
        {
          display: "inline-block",
          opacity: 1,
          width: "fit-content",
        },
        {
          duration: 0.1,
          delay: stagger(0.1),
          ease: "easeOut",
        }
      );

      // Wait for display time
      await new Promise(resolve => setTimeout(resolve, cycleDelay));

      // Type out current words (reverse animation)
      await animate(
        "span",
        {
          opacity: 0,
          width: 0,
        },
        {
          duration: 0.05,
          delay: stagger(0.03, { from: "last" }),
          ease: "easeIn",
        }
      );

      // Switch to next set of words
      setCurrentIndex((prev) => (prev + 1) % wordsArray.length);
      setIsAnimating(false);
    };

    startCycle();
  }, [currentIndex, wordsArray.length, cycleDelay, animate, isAnimating]);

  // Split current words into characters
  const currentWords = wordsArray[currentIndex]?.map((word) => ({
    ...word,
    text: word.text.split(""),
  })) || [];

  const renderWords = () => {
    return (
      <motion.div ref={scope} className="inline">
        {currentWords.map((word, idx) => {
          return (
            <div key={`word-${currentIndex}-${idx}`} className="inline-block">
              {word.text.map((char, index) => (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  key={`char-${currentIndex}-${idx}-${index}`}
                  className={cn(
                    `dark:text-white text-black`,
                    word.className
                  )}
                >
                  {char}
                </motion.span>
              ))}
              &nbsp;
            </div>
          );
        })}
      </motion.div>
    );
  };

  return (
    <div className={cn("text-base sm:text-xl md:text-3xl lg:text-5xl font-bold text-center", className)}>
      {renderWords()}
    </div>
  );
};
