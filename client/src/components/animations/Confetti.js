import confetti from 'canvas-confetti';

/**
 * Trigger a celebratory confetti particle burst
 */
export const triggerConfetti = (options = {}) => {
  const defaults = {
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#06A3DA', '#f7ce58', '#073f69', '#ffffff', '#8338ec'],
    disableForReducedMotion: true,
  };

  confetti({
    ...defaults,
    ...options,
  });
};

/**
 * Trigger continuous fireworks/side cannons effect (e.g. For major achievements or registrations)
 */
export const triggerAchievementFireworks = () => {
  const duration = 2.5 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 40 * (timeLeft / duration);
    confetti({
      ...defaults,
      particleCount,
      origin: { x: 0.2 + Math.random() * 0.6, y: Math.random() - 0.2 },
      colors: ['#06A3DA', '#f7ce58', '#00d2ff', '#ffffff'],
    });
  }, 250);
};
