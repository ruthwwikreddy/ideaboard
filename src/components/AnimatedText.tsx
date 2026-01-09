import { motion } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AnimatedTextProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

// Gradient text with shimmer effect
export const GradientText = ({ children, className }: AnimatedTextProps) => {
  return (
    <motion.span
      className={cn(
        "bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent bg-[length:200%_100%]",
        className
      )}
      animate={{
        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
      }}
      transition={{
        duration: 5,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      {children}
    </motion.span>
  );
};

// Text that reveals character by character
export const RevealText = ({ children, className, delay = 0 }: AnimatedTextProps) => {
  const text = typeof children === "string" ? children : "";
  const words = text.split(" ");

  return (
    <motion.span className={className}>
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="inline-block">
          {word.split("").map((char, charIndex) => (
            <motion.span
              key={charIndex}
              className="inline-block"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: delay + (wordIndex * word.length + charIndex) * 0.03,
                duration: 0.3,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {char}
            </motion.span>
          ))}
          <span>&nbsp;</span>
        </span>
      ))}
    </motion.span>
  );
};

// Typewriter effect
export const TypewriterText = ({ children, className, delay = 0 }: AnimatedTextProps) => {
  const text = typeof children === "string" ? children : "";

  return (
    <motion.span
      className={cn("inline-block", className)}
      initial={{ width: 0 }}
      animate={{ width: "auto" }}
      transition={{
        delay,
        duration: text.length * 0.05,
        ease: "linear",
      }}
      style={{ overflow: "hidden", whiteSpace: "nowrap" }}
    >
      {text}
    </motion.span>
  );
};

// Counter animation for numbers
interface CounterProps {
  value: number;
  suffix?: string;
  className?: string;
  duration?: number;
}

export const AnimatedCounter = ({ value, suffix = "", className, duration = 2 }: CounterProps) => {
  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {value}{suffix}
      </motion.span>
    </motion.span>
  );
};

// Highlight text with animated underline
export const HighlightText = ({ children, className }: AnimatedTextProps) => {
  return (
    <span className={cn("relative inline-block", className)}>
      {children}
      <motion.span
        className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-primary to-primary/50"
        initial={{ width: 0 }}
        whileInView={{ width: "100%" }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      />
    </span>
  );
};
