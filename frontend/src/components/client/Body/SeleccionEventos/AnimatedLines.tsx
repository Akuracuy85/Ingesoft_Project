// src/components/AnimatedLines.tsx
import { useScroll, animated } from "@react-spring/web";
import styles from "./animated-lines.module.css";

const X_LINES = 40;
const INITIAL_WIDTH = 20;

export default function AnimatedLines() {
  const { scrollYProgress } = useScroll({
    default: { immediate: true },
  });

  return (
    <div className={styles.wrapper}>
      {/* Lado izquierdo */}
      <div className={styles.leftContainer}>
        {Array.from({ length: X_LINES }).map((_, i) => {
          const pos = (i + 1) / X_LINES; // normal
          return (
            <animated.div
              key={`left-${i}`}
              className={styles.bar}
              style={{
                width: scrollYProgress.to((scrollP: number) =>
                  INITIAL_WIDTH / 4 +
                  40 *
                    Math.cos(((pos - scrollP) * Math.PI) / 1.5) ** 32
                ),
              }}
            />
          );
        })}
      </div>

      {/* Lado derecho — invertimos el PROGRESO, no las barras */}
      <div className={styles.rightContainer}>
        {Array.from({ length: X_LINES }).map((_, i) => {
          const pos = (i + 1) / X_LINES; // misma posición, pero progreso invertido
          return (
            <animated.div
              key={`right-${i}`}
              className={styles.bar}
              style={{
                width: scrollYProgress.to((scrollP: number) =>
                  INITIAL_WIDTH / 4 +
                  40 *
                    Math.cos(((pos - (1 - scrollP)) * Math.PI) / 1.5) ** 32
                ),
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
