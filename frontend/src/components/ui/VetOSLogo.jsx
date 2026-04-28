export default function VetOSLogo({ size = 32, white = false, showText = true }) {
  const iconBg  = white ? "rgba(255,255,255,0.15)" : "#6366F1";
  const pulse   = white ? "#ffffff" : "#ffffff";
  const textMain = white ? "#ffffff" : "#0F172A";
  const textBrand = white ? "rgba(255,255,255,0.8)" : "#6366F1";

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      {/* Icono */}
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="11" fill={iconBg} />
        {/* Cruz veterinaria + ECG */}
        <path
          d="M6 20 L11 20 L13 14 L16 26 L18.5 18 L21 22 L23.5 20 L28 20"
          stroke={pulse} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"
        />
        {/* Pequeña pata abajo a la derecha */}
        <circle cx="31" cy="28" r="1.5" fill={pulse} opacity="0.6" />
        <circle cx="34" cy="26.5" r="1.2" fill={pulse} opacity="0.6" />
        <circle cx="33" cy="30" r="1.2" fill={pulse} opacity="0.6" />
        <ellipse cx="32" cy="28.5" rx="2" ry="2.5" fill={pulse} opacity="0.3" />
      </svg>

      {showText && (
        <div style={{ lineHeight: 1 }}>
          <div style={{
            fontSize: size * 0.52,
            fontWeight: 900,
            letterSpacing: "-0.03em",
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
            color: textMain,
          }}>
            Vet<span style={{ color: textBrand }}>OS</span>
          </div>
          <div style={{
            fontSize: size * 0.26,
            fontWeight: 600,
            color: white ? "rgba(255,255,255,0.45)" : "#94A3B8",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginTop: 1,
          }}>
            Platform
          </div>
        </div>
      )}
    </div>
  );
}
