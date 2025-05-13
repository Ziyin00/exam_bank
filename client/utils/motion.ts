import { Variants } from "framer-motion";

/**
 * FadeIn Animation Variant
 *
 * @param direction - Optional: "left", "right", "up", "down" to specify fade-in direction.
 * @param type - Optional: Animation type (e.g., "spring", "tween"). Default is "tween".
 * @param delay - Optional: Delay before the animation starts in seconds. Default is 0.
 * @param duration - Optional: Duration of the animation in seconds. Default is 0.5.
 * @param distance - Optional: Distance to move from if a direction is specified. Default is 50.
 * @param staggerChildren - Optional: If this element has children with variants, this sets the stagger delay.
 * @param delayChildren - Optional: If this element has children with variants, this sets the delay before children start animating.
 * @returns Framer Motion Variants object for a fade-in effect.
 */
export const fadeIn = (
  direction?: "left" | "right" | "up" | "down",
  type: string = "tween",
  delay: number = 0,
  duration: number = 0.5,
  distance: number = 50,
  staggerChildren?: number,
  delayChildren?: number
): Variants => {
  const initial: { opacity: number; x?: number; y?: number } = { opacity: 0 };
  const animate: { opacity: number; x?: number; y?: number; transition: any } = {
    opacity: 1,
    transition: {
      type,
      delay,
      duration,
      ease: "easeOut", // A common ease for smooth fade-ins
      ...(staggerChildren && { staggerChildren }), // Add staggerChildren if provided
      ...(delayChildren && { delayChildren }),     // Add delayChildren if provided
    },
  };

  switch (direction) {
    case "left":
      initial.x = distance;
      animate.x = 0;
      break;
    case "right":
      initial.x = -distance;
      animate.x = 0;
      break;
    case "up":
      initial.y = distance;
      animate.y = 0;
      break;
    case "down":
      initial.y = -distance;
      animate.y = 0;
      break;
    default:
      // No directional movement, just fade
      break;
  }

  return {
    hidden: initial,
    visible: animate, // or 'show' if you prefer that name for the animate state
  };
};

/**
 * SlideIn Animation Variant (Example similar to your existing slideInFromBottom)
 *
 * @param direction - "left", "right", "up", "down".
 * @param type - Animation type (e.g., "spring", "tween").
 * @param delay - Delay before the animation starts.
 * @param duration - Duration of the animation.
 * @returns Framer Motion Variants object for a slide-in effect.
 */
export const slideIn = (
  direction: "left" | "right" | "up" | "down",
  type: string = "spring", // Spring often looks good for slide-ins
  delay: number = 0,
  duration: number = 0.75,
  distance: number = 100 // Default distance for slide
): Variants => {
  const initial: { opacity: number; x?: string | number; y?: string | number } = { opacity: 0 };
  const animate: { opacity: number; x?: string | number; y?: string | number; transition: any } = {
    opacity: 1,
    transition: {
      type,
      delay,
      duration,
      ease: "easeOut",
    },
  };

  switch (direction) {
    case "left":
      initial.x = "-100%"; // Start off-screen to the left
      animate.x = 0;
      break;
    case "right":
      initial.x = "100%"; // Start off-screen to the right
      animate.x = 0;
      break;
    case "up":
      initial.y = "100%"; // Start off-screen below
      animate.y = 0;
      break;
    case "down":
      initial.y = "-100%"; // Start off-screen above
      animate.y = 0;
      break;
  }

  return {
    hidden: initial,
    visible: animate,
  };
};


// Your existing slideInFromBottom (can be kept or use the more generic slideIn)
export const slideInFromBottom = {
  hidden: { y: 100, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      delay: 0.2, // Example delay
      duration: 0.6, // Example duration
      type: "spring",
      stiffness: 120,
    },
  },
};

// You might also want a simple text variant for staggered text animations
export const textVariant = (delay?: number): Variants => ({
  hidden: {
    y: 50,
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      duration: 1.25,
      delay: delay || 0,
    },
  },
});

// Example for staggering container
export const staggerContainer = (staggerChildren?: number, delayChildren?: number): Variants => ({
  hidden: {},
  visible: { // or 'show'
    transition: {
      staggerChildren: staggerChildren || 0.1, // Default stagger
      delayChildren: delayChildren || 0,
    },
  },
});










// export function slideInFromLeft(delay: number) {
//     return {
//       hidden: { x: -100, opacity: 0 },
//       visible: {
//         x: 0,
//         opacity: 1,
//         transition: {
//           delay: delay,
//           duration: 0.5,
//         },
//       },
//     };
//   }
  
//   export function slideInFromRight(delay: number) {
//     return {
//       hidden: { x: 100, opacity: 0 },
//       visible: {
//         x: 0,
//         opacity: 1,
//         transition: {
//           delay: delay,
//           duration: 0.5,
//         },
//       },
//     };
//   }
  
//   export const slideInFromTop = {
//     hidden: { y: -100, opacity: 0 },
//     visible: {
//       y: 0,
//       opacity: 1,
//       transition: {
//         delay: 0.5,
//         duration: 0.5,
//       },
//     },
// };
  
  
// export const slideInFromBottom = {
//     hidden: { y: 100, opacity: 0 },
//     visible: {
//       y: 0,
//       opacity: 1,
//       transition: {
//         delay: 0.5,
//         duration: 0.5,
//       },
//     },
//   };