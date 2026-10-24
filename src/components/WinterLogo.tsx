import React from 'react';

interface WinterLogoProps {
  size?: number;
  className?: string;
  showGlow?: boolean;
}

export const WinterLogo: React.FC<WinterLogoProps> = ({
  size = 36,
  className = '',
  showGlow = true,
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
        className="w-full h-full drop-shadow-md"
      >
        <defs>
          <linearGradient id="logo-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0a1120" />
            <stop offset="50%" stop-color="#0f1d36" />
            <stop offset="100%" stop-color="#050a14" />
          </linearGradient>

          <linearGradient id="w-facet-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#e0f2fe" />
            <stop offset="60%" stop-color="#38bdf8" />
            <stop offset="100%" stop-color="#0284c7" />
          </linearGradient>

          <linearGradient id="w-facet-2" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#0369a1" />
            <stop offset="50%" stop-color="#0ea5e9" />
            <stop offset="100%" stop-color="#bae6fd" />
          </linearGradient>

          <linearGradient id="w-facet-3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#f0f9ff" />
            <stop offset="50%" stop-color="#7dd3fc" />
            <stop offset="100%" stop-color="#0284c7" />
          </linearGradient>

          <linearGradient id="w-facet-4" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#e0f2fe" />
            <stop offset="60%" stop-color="#38bdf8" />
            <stop offset="100%" stop-color="#0369a1" />
          </linearGradient>

          {showGlow && (
            <filter id="w-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="12" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          )}
        </defs>

        {/* Squircle Background */}
        <rect width="512" height="512" rx="112" fill="url(#logo-bg)" />
        <rect
          width="504"
          height="504"
          x="4"
          y="4"
          rx="108"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="3"
          strokeOpacity="0.35"
        />

        {/* Glacial Hexagon Accent */}
        <polygon
          points="256,76 396,156 396,356 256,436 116,356 116,156"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="2.5"
          strokeOpacity="0.25"
          strokeDasharray="6 8"
        />

        {/* Frost Shadow */}
        <path
          d="M 124 162 L 206 376 L 256 270 L 306 376 L 388 162 L 348 162 L 286 324 L 256 242 L 226 324 L 164 162 Z"
          fill="#0284c7"
          opacity="0.35"
          filter={showGlow ? 'url(#w-glow)' : undefined}
        />

        {/* Crystalline "W" Facets */}
        <polygon points="120,160 164,160 216,380 180,380" fill="url(#w-facet-1)" />
        <polygon points="180,380 216,380 256,260 240,240" fill="url(#w-facet-2)" />
        <polygon points="240,240 256,216 272,240 256,264" fill="#ffffff" />
        <polygon points="272,240 256,260 296,380 332,380" fill="url(#w-facet-3)" />
        <polygon points="332,380 296,380 348,160 392,160" fill="url(#w-facet-4)" />

        {/* Crisp Ice Crest Edge Highlights */}
        <polyline
          points="120,160 180,380 256,216 332,380 392,160"
          fill="none"
          stroke="#ffffff"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <line x1="164" y1="160" x2="216" y2="380" stroke="#bae6fd" strokeWidth="2" strokeOpacity="0.8" />
        <line x1="348" y1="160" x2="296" y2="380" stroke="#bae6fd" strokeWidth="2" strokeOpacity="0.8" />

        {/* Star Sparkles on W Peaks */}
        <g transform="translate(120, 160)">
          <circle cx="0" cy="0" r="5" fill="#ffffff" />
          <path d="M 0 -14 L 0 14 M -14 0 L 14 0" stroke="#e0f2fe" strokeWidth="2" strokeLinecap="round" />
        </g>
        <g transform="translate(256, 216)">
          <circle cx="0" cy="0" r="6" fill="#ffffff" />
          <path d="M 0 -18 L 0 18 M -18 0 L 18 0 M -7 -7 L 7 7 M -7 7 L 7 -7" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
        </g>
        <g transform="translate(392, 160)">
          <circle cx="0" cy="0" r="5" fill="#ffffff" />
          <path d="M 0 -14 L 0 14 M -14 0 L 14 0" stroke="#e0f2fe" strokeWidth="2" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
};
