// Elemento decorativo de marca VetOS — línea de latido como divider o fondo
export default function ECGLine({ color = "rgba(99,102,241,0.45)", height = 24, strokeWidth = 1.5 }) {
  return (
    <svg
      width="100%" height={height}
      viewBox="0 0 280 24"
      preserveAspectRatio="xMidYMid meet"
      style={{ display: "block" }}
    >
      <path
        d="M0 12 L55 12 L65 4 L75 20 L82 8 L89 16 L96 12 L280 12"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
