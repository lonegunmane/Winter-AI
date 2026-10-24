import React from 'react';

interface FrostySnowflakeLogoProps {
  size?: number;
  className?: string;
  showGlow?: boolean;
  spinning?: boolean;
}

export const FrostySnowflakeLogo: React.FC<FrostySnowflakeLogoProps> = ({
  size = 36,
  className = '',
  showGlow = true,
  spinning = false,
}) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}
    >
      <svg
        viewBox="0 0 512 512"
        width={size}
        height={size}
        className="w-full h-full drop-shadow-[0_2px_12px_rgba(56,189,248,0.35)]"
      >
        <defs>
          {/* Deep Space Black + Smoky Frost Gradient */}
          <linearGradient id="frosty-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#030712" />
            <stop offset="50%" stopColor="#0b1329" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>

          {/* Ice Crystal Gradient */}
          <linearGradient id="ice-crystal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#e0f2fe" />
            <stop offset="75%" stopColor="#7dd3fc" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>

          {/* Core Gem Gradient */}
          <radialGradient id="frost-core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor="#7dd3fc" />
            <stop offset="70%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#0369a1" />
          </radialGradient>

          {showGlow && (
            <filter id="frost-glow" x="-25%" y="-25%" width="150%" height="150%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          )}
        </defs>

        {/* Squircle with subtle frosted border */}
        <rect width="512" height="512" rx="120" fill="url(#frosty-bg)" />
        <rect
          width="504"
          height="504"
          x="4"
          y="4"
          rx="116"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="3"
          strokeOpacity="0.35"
        />

        {/* Ambient Ice Glow Ring */}
        <circle
          cx="256"
          cy="256"
          r="185"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="2"
          strokeOpacity="0.2"
          strokeDasharray="6 10"
        />

        {/* Hexagonal Star Orbit */}
        <polygon
          points="256,96 394,176 394,336 256,416 118,336 118,176"
          fill="none"
          stroke="#7dd3fc"
          strokeWidth="2.5"
          strokeOpacity="0.3"
        />

        {/* Elegant Frosty Snowflake (Gently rotates when spinning) */}
        <g
          filter={showGlow ? 'url(#frost-glow)' : undefined}
          className={spinning ? 'animate-frost-spin' : ''}
          style={spinning ? { transformOrigin: '256px 256px' } : undefined}
        >
          {/* Main 6 Radial Axes (60 degrees each) */}
          {[0, 60, 120, 180, 240, 300].map((angle, idx) => (
            <g key={idx} transform={`rotate(${angle} 256 256)`}>
              {/* Central Spine */}
              <line
                x1="256"
                y1="256"
                x2="256"
                y2="92"
                stroke="url(#ice-crystal)"
                strokeWidth="11"
                strokeLinecap="round"
              />

              {/* Outer Chevron Branches */}
              <path
                d="M 230 148 L 256 122 L 282 148"
                fill="none"
                stroke="url(#ice-crystal)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Inner Chevron Branches */}
              <path
                d="M 224 196 L 256 164 L 288 196"
                fill="none"
                stroke="url(#ice-crystal)"
                strokeWidth="8.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Tip Ice Diamond */}
              <polygon
                points="256,76 264,88 256,98 248,88"
                fill="#ffffff"
              />
            </g>
          ))}

          {/* Central Layered Core Frost Gem */}
          <circle
            cx="256"
            cy="256"
            r="38"
            fill="#0b1329"
            stroke="url(#ice-crystal)"
            strokeWidth="5"
          />
          <circle
            cx="256"
            cy="256"
            r="24"
            fill="url(#frost-core)"
          />
          <circle
            cx="256"
            cy="256"
            r="9"
            fill="#ffffff"
          />

          {/* Star Glint */}
          <polygon
            points="256,236 261,251 276,256 261,261 256,276 251,261 236,256 251,251"
            fill="#ffffff"
            opacity="0.9"
          />
        </g>
      </svg>
    </div>
  );
};
