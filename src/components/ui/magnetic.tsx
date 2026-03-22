import { ReactElement, cloneElement, useEffect, useRef } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

interface MagneticProps {
  children: ReactElement;
  intensity?: number;
}

export const Magnetic = ({ children, intensity = 0.5 }: MagneticProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const springConfig = { damping: 15, stiffness: 150, mass: 0.1 };
  
  const x = useSpring(0, springConfig);
  const y = useSpring(0, springConfig);

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      if (ref.current) {
        const { height, width, left, top } = ref.current.getBoundingClientRect();
        const middleX = clientX - (left + width / 2);
        const middleY = clientY - (top + height / 2);
        
        // Intensitas tarikan magnet
        x.set(middleX * intensity);
        y.set(middleY * intensity);
      }
    };

    const reset = () => {
      x.set(0);
      y.set(0);
    };

    const element = ref.current;
    if (element) {
      element.addEventListener("mousemove", handleMouse);
      element.addEventListener("mouseleave", reset);

      return () => {
        element.removeEventListener("mousemove", handleMouse);
        element.removeEventListener("mouseleave", reset);
      };
    }
  }, [x, y, intensity]);

  return (
    <motion.div ref={ref} style={{ x, y }} className="inline-block relative z-50">
      {children}
    </motion.div>
  );
};
