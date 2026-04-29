// ZOVITA Logo — ECG que termina en pata de animal
// Props: size, white, showText, hero (solo ícono grande para paneles)

export default function VetOSLogo({ size = 32, white = false, showText = true, hero = false }) {
  const iconBg     = white ? "rgba(255,255,255,0.12)" : "#6366F1";
  const iconBg2    = white ? "rgba(255,255,255,0.06)" : "#4F46E5";
  const stroke     = "#ffffff";
  const textMain   = white ? "#ffffff" : "#0F172A";
  const textAccent = white ? "rgba(255,255,255,0.75)" : "#6366F1";

  const icon = (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="vetosGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={iconBg}/>
          <stop offset="100%" stopColor={iconBg2}/>
        </linearGradient>
        {/* Glow filter */}
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      <rect width="40" height="40" rx="11" fill="url(#vetosGrad)"/>

      {/* Línea ECG con glow */}
      <path
        d="M3 21 L9 21 L12 12 L16 30 L19 18 L22 24 L25 21 L30 21"
        stroke={stroke} strokeWidth="2.4"
        strokeLinecap="round" strokeLinejoin="round"
        fill="none" filter="url(#glow)"
      />

      {/* Pata al final — almohadilla + 4 dedos */}
      <ellipse cx="34"   cy="23.5" rx="2.8" ry="2.2"  fill={stroke} opacity="0.95"/>
      <circle  cx="31"   cy="20.2" r="1.35" fill={stroke} opacity="0.95"/>
      <circle  cx="33.5" cy="19.2" r="1.35" fill={stroke} opacity="0.95"/>
      <circle  cx="36.2" cy="19.8" r="1.35" fill={stroke} opacity="0.95"/>
      <circle  cx="37.8" cy="22"   r="1.15" fill={stroke} opacity="0.95"/>
    </svg>
  );

  // Variante hero — solo el ícono, sin texto inline
  if (hero) return icon;

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: size * 0.28 }}>
      {icon}
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
            Zo<span style={{ color: textAccent, fontWeight: 900 }}>VITA</span>
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
