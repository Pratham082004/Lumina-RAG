import React, { useEffect, useRef, useState } from 'react';
import { useInView, animate } from 'framer-motion';

export interface AnimatedCounterProps {
  value: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ value }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px" });
  
  // Extract prefix, number (ignoring commas), and suffix
  const match = value.match(/^([^0-9.-]*)([0-9,.]+)([^0-9]*)$/);
  
  const prefix = match ? match[1] : '';
  const numStr = match ? match[2].replace(/,/g, '') : '0';
  const suffix = match ? match[3] : value;
  
  const targetNum = parseFloat(numStr);
  const decimals = numStr.includes('.') ? numStr.split('.')[1].length : 0;
  
  const [display, setDisplay] = useState(
    isNaN(targetNum) ? value : "0"
  );
  
  useEffect(() => {
    if (inView && !isNaN(targetNum)) {
      const controls = animate(0, targetNum, {
        duration: 2,
        ease: "easeOut",
        onUpdate: (latest) => {
          if (decimals > 0) {
            setDisplay(latest.toFixed(decimals));
          } else {
            // Re-apply locale string for commas like "12,400"
            setDisplay(Math.floor(latest).toLocaleString("en-US"));
          }
        },
      });
      return () => controls.stop();
    }
  }, [inView, targetNum, decimals]);
  
  if (isNaN(targetNum)) {
    return <span>{value}</span>;
  }
  
  return (
    <span ref={ref}>
      {prefix}{display}{suffix}
    </span>
  );
};

export default AnimatedCounter;
