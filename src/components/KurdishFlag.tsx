"use client";

interface KurdishFlagProps {
  className?: string;
}

// Kurdish Flag with proper 21-ray sun
export function KurdishFlag({ className = "w-6 h-4" }: KurdishFlagProps) {
  // 21 rays, each rotated by 360/21 = 17.1429 degrees
  const rays = Array.from({ length: 21 }, (_, i) => i * (360 / 21));

  return (
    <svg className={`${className} rounded-sm shadow-sm`} viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
      {/* Red stripe */}
      <rect width="900" height="200" y="0" fill="#D72828" />

      {/* White stripe */}
      <rect width="900" height="200" y="200" fill="#FFFFFF" />

      {/* Green stripe */}
      <rect width="900" height="200" y="400" fill="#1EB53A" />

      {/* Sun with 21 rays */}
      <g transform="translate(450,300)">
        {/* Central circle */}
        <circle r="85" fill="#F7C600" />

        {/* 21 triangle rays */}
        <g fill="#F7C600">
          {rays.map((rotation, i) => (
            <polygon
              key={i}
              points="0,-150 10,-90 -10,-90"
              transform={`rotate(${rotation})`}
            />
          ))}
        </g>
      </g>
    </svg>
  );
}

// German Flag
export function GermanFlag({ className = "w-6 h-4" }: { className?: string }) {
  return (
    <span className={`${className} rounded-sm overflow-hidden flex flex-col shadow-sm`}>
      <span className="flex-1 bg-black" />
      <span className="flex-1 bg-red-600" />
      <span className="flex-1 bg-yellow-400" />
    </span>
  );
}
