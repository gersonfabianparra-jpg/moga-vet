export default function VetOSLogo({ size = 32, white = false, showText = true }) {
  const iconBg    = white ? "rgba(255,255,255,0.12)" : "#6366F1";
  const iconBg2   = white ? "rgba(255,255,255,0.06)" : "#4F46E5";
  const stroke    = "#ffffff";
  const textMain  = white ? "#ffffff" : "#0F172A";
  const textAccent = white ? "rgba(255,255,255,0.75)" : "#6366F1";

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: size * 0.28 }}>
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Fondo con gradiente */}
        <defs>
          <linearGradient id="vetosGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={iconBg}/>
            <stop offset="100%" stopColor={iconBg2}/>
          </linearGradient>
        </defs>
        <rect width="40" height="40" rx="11" fill="url(#vetosGrad)"/>

        {/* Línea ECG */}
        <path
          d="M3 21 L9 21 L12 12 L16 30 L19 18 L22 24 L25 21 L30 21"
          stroke={stroke} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none"
        />

        {/* Pata al final de la línea */}
        <ellipse cx="34" cy="23.5" rx="2.8" ry="2.2" fill={stroke} opacity="0.92"/>
        <circle cx="31"   cy="20.2" r="1.35" fill={stroke} opacity="0.92"/>
        <circle cx="33.5" cy="19.2" r="1.35" fill={stroke} opacity="0.92"/>
        <circle cx="36.2" cy="19.8" r="1.35" fill={stroke} opacity="0.92"/>
        <circle cx="37.8" cy="22"   r="1.15" fill={stroke} opacity="0.92"/>
      </svg>

      {showText && (
        <div style={{ lineHeight: 1 }}>
          <div style={{
            fontSize: size * 0.5,
            fontWeight: 900,
            letterSpacing: "-0.04em",
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
            color: textMain,
            lineHeight: 1,
          }}>
            Vet<span style={{ color: textAccent, fontWeight: 900 }}>OS</span>
          </div>
          <div style={{
            fontSize: size * 0.24,
            fontWeight: 700,
            color: white ? "rgba(255,255,255,0.35)" : "#94A3B8",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            marginTop: 2,
          }}>
            Platform
          </div>
        </div>
      )}
    </div>
  );
}
