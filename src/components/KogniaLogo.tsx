import React from 'react';

interface KogniaLogoProps {
  className?: string;
  variant?: 'white' | 'navy';
}

export const KogniaLogo: React.FC<KogniaLogoProps> = ({
  className = 'h-9',
  variant = 'white',
}) => {
  const fill = variant === 'white' ? '#FFFFFF' : '#0F2942';

  return (
    <div className={`inline-flex items-center select-none ${className}`} aria-label="Kognia Labs">
      <svg
        viewBox="0 0 310 112"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto"
      >
        {/* Molecular Node Graph */}
        <g stroke={fill} strokeWidth="6.5" strokeLinecap="round">
          <line x1="33" y1="53" x2="29" y2="16" />
          <line x1="33" y1="53" x2="68" y2="33" />
          <line x1="33" y1="53" x2="20" y2="89" />
          <line x1="33" y1="53" x2="56" y2="86" />
        </g>

        {/* Nodes */}
        <circle cx="33" cy="53" r="16.5" fill={fill} />
        <circle cx="29" cy="15" r="11" fill={fill} />
        <circle cx="69" cy="33" r="11.5" fill={fill} />
        <circle cx="20" cy="90" r="10" fill={fill} />
        <circle cx="56" cy="86" r="9.5" fill={fill} />

        {/* Wordmark "Kognia" */}
        <text
          x="94"
          y="71"
          fill={fill}
          fontFamily="'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif"
          fontWeight="600"
          fontSize="58"
          letterSpacing="-0.03em"
        >
          Kognia
        </text>

        {/* Sub-wordmark "Labs" */}
        <text
          x="212"
          y="102"
          fill={fill}
          fontFamily="'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif"
          fontWeight="400"
          fontSize="31"
          letterSpacing="-0.02em"
        >
          Labs
        </text>
      </svg>
    </div>
  );
};
