"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Cycling typewriter component that types, waits, erases, and cycles to next text
 * @param {Object} props - Component props
 * @param {Array[]} props.textOptions - Array of word arrays to cycle through
 * @param {string} props.className - CSS classes
 * @param {number} props.typeSpeed - Speed of typing (ms per character)
 * @param {number} props.eraseSpeed - Speed of erasing (ms per character)
 * @param {number} props.waitTime - Time to wait after typing completes (ms)
 * @returns {JSX.Element} The cycling typewriter component
 */
export const CyclingTypewriterWithErase = ({
  textOptions,
  className = "",
  typeSpeed = 100,
  eraseSpeed = 50,
  waitTime = 1500,
}) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [isWaiting, setIsWaiting] = useState(false);
  const [isErasing, setIsErasing] = useState(false);
  const [displayedText, setDisplayedText] = useState([]);

  const currentWords = textOptions[currentTextIndex] || [];
  const currentWord = currentWords[currentWordIndex];

  useEffect(() => {
    if (!currentWord) return;

    const timer = setTimeout(() => {
      if (isWaiting) {
        // Start erasing after wait time
        setIsWaiting(false);
        setIsErasing(true);
        return;
      }

      if (isErasing) {
        // Erase characters from the last word backwards
        const lastWordIndex = displayedText.length - 1;
        if (lastWordIndex >= 0 && displayedText[lastWordIndex]) {
          const lastWord = displayedText[lastWordIndex];
          if (lastWord.displayedText && lastWord.displayedText.length > 0) {
            setDisplayedText(prev => {
              const newDisplayed = [...prev];
              newDisplayed[lastWordIndex] = {
                ...lastWord,
                displayedText: lastWord.displayedText.slice(0, -1)
              };
              return newDisplayed;
            });
          } else {
            // Remove the empty word and continue erasing
            setDisplayedText(prev => prev.slice(0, -1));
          }
        } else {
          // Done erasing, move to next text
          setIsErasing(false);
          setIsTyping(true);
          setCurrentTextIndex((prev) => (prev + 1) % textOptions.length);
          setCurrentWordIndex(0);
          setCurrentCharIndex(0);
          setDisplayedText([]);
        }
        return;
      }

      if (isTyping) {
        if (currentCharIndex < currentWord.text.length) {
          // Continue typing current word
          const newChar = currentWord.text[currentCharIndex];
          setDisplayedText(prev => {
            const newDisplayed = [...prev];
            const wordIndex = currentWordIndex;
            
            if (!newDisplayed[wordIndex]) {
              newDisplayed[wordIndex] = {
                text: currentWord.text,
                className: currentWord.className,
                displayedText: ""
              };
            }
            
            newDisplayed[wordIndex] = {
              ...newDisplayed[wordIndex],
              displayedText: newDisplayed[wordIndex].displayedText + newChar
            };
            
            return newDisplayed;
          });
          setCurrentCharIndex(prev => prev + 1);
        } else {
          // Finished current word, move to next word
          if (currentWordIndex < currentWords.length - 1) {
            setCurrentWordIndex(prev => prev + 1);
            setCurrentCharIndex(0);
          } else {
            // Finished all words, start waiting
            setIsTyping(false);
            setIsWaiting(true);
          }
        }
      }
    }, isErasing ? eraseSpeed : isWaiting ? waitTime : typeSpeed);

    return () => clearTimeout(timer);
  }, [
    currentCharIndex,
    currentWordIndex,
    currentTextIndex,
    isTyping,
    isWaiting,
    isErasing,
    currentWord,
    displayedText,
    typeSpeed,
    eraseSpeed,
    waitTime,
    textOptions,
    currentWords.length
  ]);

  return (
    <div className={cn("flex flex-wrap justify-center items-center", className)}>
      {displayedText.map((word, index) => (
        <span
          key={`${currentTextIndex}-${index}`}
          className={cn("inline-block mr-2", word.className)}
        >
          {word.displayedText}
        </span>
      ))}
      <motion.span
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        className="inline-block h-5 w-[3px] bg-blue-400 ml-1"
      />
    </div>
  );
};
