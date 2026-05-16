'use client'

interface SilhouetteProps {
  opacity: number
}

export function Silhouette({ opacity }: SilhouetteProps) {
  return (
    <div
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
      style={{ opacity, transition: 'opacity 1s ease' }}
    >
      <svg
        viewBox="0 0 200 400"
        width="160"
        height="320"
        style={{
          filter: 'drop-shadow(0 0 12px rgba(255,255,255,0.25)) blur(0.5px)',
        }}
      >
        <defs>
          <filter id="silhouette-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Head */}
        <circle
          cx="100"
          cy="45"
          r="28"
          fill="rgba(255,255,255,0.12)"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="1.5"
          filter="url(#silhouette-glow)"
        />
        {/* Neck */}
        <rect
          x="91"
          y="71"
          width="18"
          height="20"
          fill="rgba(255,255,255,0.1)"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1"
        />
        {/* Torso */}
        <path
          d="M60,90 L140,90 L150,220 L50,220 Z"
          fill="rgba(255,255,255,0.10)"
          stroke="rgba(255,255,255,0.30)"
          strokeWidth="1.5"
          filter="url(#silhouette-glow)"
        />
        {/* Left arm */}
        <path
          d="M60,95 L30,175 L42,178 L68,105"
          fill="rgba(255,255,255,0.09)"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="1.2"
        />
        {/* Right arm */}
        <path
          d="M140,95 L170,175 L158,178 L132,105"
          fill="rgba(255,255,255,0.09)"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="1.2"
        />
        {/* Left leg */}
        <path
          d="M75,220 L65,340 L90,340 L100,235"
          fill="rgba(255,255,255,0.09)"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="1.2"
        />
        {/* Right leg */}
        <path
          d="M125,220 L135,340 L110,340 L100,235"
          fill="rgba(255,255,255,0.09)"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="1.2"
        />

        {/* V on chest */}
        <path
          d="M82,130 L100,165 L118,130"
          fill="none"
          stroke="rgba(255,255,255,0.7)"
          strokeWidth="3.5"
          strokeLinecap="round"
          filter="url(#silhouette-glow)"
        />
      </svg>
    </div>
  )
}
