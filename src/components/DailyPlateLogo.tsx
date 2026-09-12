import React from 'react';

interface DailyPlateLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  subtitle?: string;
}

export const DailyPlateLogo: React.FC<DailyPlateLogoProps> = ({
  size = 'md',
  showText = true,
  subtitle,
}) => {
  const iconDimensions = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  }[size];

  return (
    <div className="flex items-center gap-2.5">
      {/* DailyPlate Emblem SVG matching Image 5 & 6 */}
      <div className={`relative flex items-center justify-center rounded-full bg-[#e8f1ec] ${iconDimensions} flex-shrink-0 shadow-xs`}>
        <svg viewBox="0 0 100 100" className="w-full h-full p-1" fill="none">
          {/* Subtle outer circular arc */}
          <path
            d="M 24, 30 A 38 38 0 1 0 84, 52"
            stroke="#206140"
            strokeWidth="7"
            strokeLinecap="round"
          />
          {/* Central organic plant leaf motif */}
          <rect x="36" y="28" width="28" height="34" rx="14" fill="#cbe3d3" />
          <path
            d="M 50, 32 L 50, 60"
            stroke="#206140"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="M 38, 45 Q 46, 52 50, 52"
            stroke="#206140"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="M 62, 45 Q 54, 52 50, 52"
            stroke="#206140"
            strokeWidth="5"
            strokeLinecap="round"
          />
          {/* Warm organic sun accent dot */}
          <circle cx="72" cy="28" r="8" fill="#e06927" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className="font-bold text-[#206140] tracking-tight leading-none text-[18px]">
            DailyPlate
          </span>
          {subtitle && (
            <span className="text-[11px] font-medium text-[#404942] tracking-wide mt-0.5">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
