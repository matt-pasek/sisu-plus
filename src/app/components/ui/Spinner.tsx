export function Spinner({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      style={{
        animation: 'spin 0.8s linear infinite',
        display: 'inline-block',
      }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle
        cx="8"
        cy="8"
        r="6"
        stroke="var(--text-tertiary)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="28"
        strokeDashoffset="10"
      />
    </svg>
  )
}
