'use client';

import { motion, type Variants } from 'framer-motion';
import React from 'react';
import { Button, type ButtonProps } from './button';

// Animation variants cho các component
export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

export const scaleIn: Variants = {
  initial: { scale: 0.95, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.95, opacity: 0 }
};

export const slideIn: Variants = {
  initial: { x: -20, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: 20, opacity: 0 }
};

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const staggerChild: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
};

// Reusable animated components
interface AnimatedDivProps {
  children: React.ReactNode;
  className?: string;
  variants?: Variants;
  initial?: string;
  animate?: string;
  exit?: string;
  transition?: object;
  layoutId?: string;
}

export const AnimatedDiv = ({
  children,
  className,
  variants = fadeInUp,
  initial = 'initial',
  animate = 'animate',
  exit = 'exit',
  transition,
  layoutId,
  ...props
}: AnimatedDivProps) => (
  <motion.div
    className={className}
    variants={variants}
    initial={initial}
    animate={animate}
    exit={exit}
    transition={transition}
    layoutId={layoutId}
    {...props}
  >
    {children}
  </motion.div>
);

export const AnimatedButton = React.forwardRef<
  HTMLButtonElement,
  ButtonProps & {
    as?: React.ElementType;
  }
>(({ children, className, onClick, disabled, variant, size, as, ...props }, ref) => {
  const Component = as || Button;
  
  return (
    <motion.div
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <Component
        ref={ref}
        className={className}
        onClick={onClick}
        disabled={disabled}
        variant={variant}
        size={size}
        {...props}
      >
        {children}
      </Component>
    </motion.div>
  );
});

AnimatedButton.displayName = 'AnimatedButton';

export const AnimatedCard = ({
  children,
  className,
  layoutId,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  layoutId?: string;
}) => (
  <motion.div
    className={className}
    variants={scaleIn}
    initial="initial"
    animate="animate"
    exit="exit"
    whileHover={{ y: -2, transition: { duration: 0.2 } }}
    layoutId={layoutId}
    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    {...props}
  >
    {children}
  </motion.div>
);

// Loading spinner với animation
export const LoadingSpinner = ({ size = 20 }: { size?: number }) => (
  <motion.div
    className="border-2 border-primary/20 border-t-primary rounded-full"
    style={{ width: size, height: size }}
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
  />
);

// Typing indicator cho chat
export const TypingIndicator = () => (
  <motion.div
    className="flex items-center space-x-1 py-2"
    variants={fadeIn}
    initial="initial"
    animate="animate"
    exit="exit"
  >
    <span className="text-sm text-muted-foreground">AI is typing</span>
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-1 h-1 bg-muted-foreground rounded-full"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2,
            ease: 'easeInOut'
          }}
        />
      ))}
    </div>
  </motion.div>
);

// Page transition wrapper
export const PageTransition = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    variants={fadeInUp}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={{ duration: 0.3, ease: 'easeOut' }}
  >
    {children}
  </motion.div>
);
