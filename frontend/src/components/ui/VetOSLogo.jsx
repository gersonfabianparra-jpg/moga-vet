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

        {/* Línea ECG — más limpia y proporcionada */}
        <path
          d="M4 21 L10 21 L13 12 L17 30 L20 18 L23 24 L26 21 L36 21"
          stroke={stroke} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none"
        />

        {/* Punto pulsante al final */}
        <circle cx="36" cy="21" r="2.2" fill={stroke} opacity="0.9"/>
        <circle cx="36" cy="21" r="4" fill={stroke} opacity="0.15"/>
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
