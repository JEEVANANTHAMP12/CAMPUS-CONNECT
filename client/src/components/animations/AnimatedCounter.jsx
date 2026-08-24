import { useEffect, useState } from 'react';

export default function AnimatedCounter({
  value = 0,
  duration = 1500,
  prefix = '',
  suffix = '',
  className = '',
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // If value is a string with non-digits (e.g. "NIRF" or "97.9%"), parse appropriately
    if (typeof value === 'string' && isNaN(parseFloat(value))) {
      return;
    }

    const target = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.]/g, '')) : value;
    if (isNaN(target)) return;

    let start = 0;
    const startTime = performance.now();

    const updateCounter = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function: cubic ease out
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(easeOut * target);

      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        setCount(target);
      }
    };

    requestAnimationFrame(updateCounter);
  }, [value, duration]);

  if (typeof value === 'string' && isNaN(parseFloat(value))) {
    return <span className={className}>{value}</span>;
  }

  return (
    <span className={className}>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}
