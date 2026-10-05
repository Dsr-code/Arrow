import confetti from 'canvas-confetti';

/**
 * Fires a celebratory confetti blast when completing a day or goal
 */
export function fireConfetti(isGoalCompleted: boolean = false) {
  try {
    if (isGoalCompleted) {
      // Big grand celebration for completing all days in a goal
      const duration = 2.5 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors: ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899'],
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors: ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899'],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    } else {
      // Subtle elegant burst for a single day milestone
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#6366f1', '#8b5cf6', '#10b981', '#38bdf8'],
        disableForReducedMotion: true,
      });
    }
  } catch {
    // Graceful fallback if confetti canvas cannot initialize
  }
}
