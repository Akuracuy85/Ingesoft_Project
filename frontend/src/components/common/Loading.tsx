import React from "react";

interface LoadingProps {
  height?: string;
  className?: string;
  fullScreen?: boolean;
  message?: string;
}

const Loading: React.FC<LoadingProps> = ({
  height = "h-48",
  className,
  fullScreen = false,
  message = "Cargando...",
}) => {
  const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");
  // tonos más oscuros para modo claro, como pediste
  const lightColors = ["#C37723", "#A65A18", "#8A4A0F", "#6F3A0C"];
  const darkColors = ["#FFD98C", "#FFC663", "#FFB347", "#E58D1A"];
  const colors = isDark ? darkColors : lightColors;

  const dots = [
    { cx: 48, cy: 8 },
    { cx: 78, cy: 20 },
    { cx: 88, cy: 48 },
    { cx: 78, cy: 76 },
    { cx: 48, cy: 88 },
    { cx: 18, cy: 76 },
    { cx: 8, cy: 48 },
    { cx: 18, cy: 20 },
  ];

  const inner = (
    <div className={`flex flex-col items-center gap-4 ${height} ${className ?? ""}`}>
      <style>{`
        @keyframes sparkMove {
          0% { left: -12%; }
          100% { left: 112%; }
        }
      `}</style>

      <div className="relative flex items-center justify-center">
        <svg
          width="160"
          height="160"
          viewBox="0 0 96 96"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="animate-spin w-40 h-40"
        >
          {dots.map((d, i) => {
            const color = colors[i % colors.length];
            return <circle key={i} cx={d.cx} cy={d.cy} r={8} fill={color} />;
          })}
        </svg>

        {/* decorative sparkle removed as requested */}
      </div>

      <div className="flex flex-col items-center">
        <span style={{ color: colors[3] }} className="text-3xl font-semibold">
          {message}
        </span>

        <div className="relative mt-3 w-96 h-2 rounded-full overflow-hidden" style={{ background: `linear-gradient(90deg, ${colors[0]}, ${colors[3]})` }}>
          {/* only keep moving spark (no shimmer gradient, no shadow) */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "0%",
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "#FFFFFF",
              transform: "translateY(-50%)",
              animation: "sparkMove 1.8s linear infinite",
            }}
          />
        </div>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div
        aria-live="polite"
        role="status"
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-white dark:bg-gray-900"
      >
        {inner}
      </div>
    );
  }

  return (
    <div role="status" className={`flex flex-col items-center justify-center ${height} ${className ?? ""}`}>
      {inner}
    </div>
  );
};

export default Loading;