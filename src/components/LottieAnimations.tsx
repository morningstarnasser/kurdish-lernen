"use client";

import { useEffect, useRef } from "react";
import Lottie, { LottieRefCurrentProps } from "lottie-react";

// Professional Lottie animations - using simplified but valid Lottie JSON

// Confetti celebration - colorful particles falling
const confettiAnimation = {
  v: "5.7.4",
  fr: 30,
  ip: 0,
  op: 60,
  w: 400,
  h: 400,
  nm: "Confetti",
  ddd: 0,
  assets: [],
  layers: Array.from({ length: 30 }, (_, i) => {
    const colors = [
      [0.98, 0.26, 0.26, 1],  // Red
      [0.3, 0.69, 0.31, 1],   // Green
      [0.13, 0.59, 0.95, 1],  // Blue
      [1, 0.76, 0.03, 1],     // Yellow
      [0.61, 0.15, 0.69, 1],  // Purple
      [1, 0.6, 0, 1],         // Orange
    ];
    const startX = 50 + Math.random() * 300;
    const endX = startX + (Math.random() - 0.5) * 100;
    return {
      ddd: 0,
      ind: i + 1,
      ty: 4,
      nm: `confetti_${i}`,
      sr: 1,
      ks: {
        o: { a: 1, k: [
          { t: 0, s: [100], e: [100] },
          { t: 50, s: [100], e: [0] },
          { t: 60, s: [0] }
        ]},
        r: { a: 1, k: [
          { t: 0, s: [0], e: [360 + Math.random() * 360] },
          { t: 60, s: [360 + Math.random() * 360] }
        ]},
        p: { a: 1, k: [
          { t: 0, s: [startX, -20, 0], e: [endX, 420, 0] },
          { t: 60, s: [endX, 420, 0] }
        ]},
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] }
      },
      ao: 0,
      shapes: [{
        ty: "gr",
        it: [
          { ty: "rc", d: 1, s: { a: 0, k: [10, 10] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 2 } },
          { ty: "fl", c: { a: 0, k: colors[i % colors.length] }, o: { a: 0, k: 100 } },
          { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
        ],
        nm: "rect"
      }],
      ip: Math.random() * 10,
      op: 60,
      st: 0,
      bm: 0
    };
  })
};

// Trophy/Star animation - golden star with sparkles
const trophyAnimation = {
  v: "5.7.4",
  fr: 30,
  ip: 0,
  op: 90,
  w: 200,
  h: 200,
  nm: "Trophy",
  ddd: 0,
  assets: [],
  layers: [
    // Main star
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "star",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 1, k: [
          { t: 0, s: [-10], e: [10] },
          { t: 45, s: [10], e: [-10] },
          { t: 90, s: [-10] }
        ]},
        p: { a: 1, k: [
          { t: 0, s: [100, 110, 0], e: [100, 95, 0] },
          { t: 20, s: [100, 95, 0], e: [100, 100, 0] },
          { t: 40, s: [100, 100, 0] }
        ]},
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 1, k: [
          { t: 0, s: [0, 0, 100], e: [115, 115, 100] },
          { t: 15, s: [115, 115, 100], e: [100, 100, 100] },
          { t: 25, s: [100, 100, 100] }
        ]}
      },
      ao: 0,
      shapes: [{
        ty: "gr",
        it: [
          {
            ty: "sr",
            sy: 1,
            d: 1,
            pt: { a: 0, k: 5 },
            p: { a: 0, k: [0, 0] },
            r: { a: 0, k: 0 },
            ir: { a: 0, k: 25 },
            is: { a: 0, k: 0 },
            or: { a: 0, k: 55 },
            os: { a: 0, k: 0 }
          },
          { ty: "fl", c: { a: 0, k: [1, 0.84, 0, 1] }, o: { a: 0, k: 100 } },
          { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
        ],
        nm: "starShape"
      }],
      ip: 0,
      op: 90,
      st: 0,
      bm: 0
    },
    // Sparkles around star
    ...Array.from({ length: 8 }, (_, i) => {
      const angle = (i * 45) * Math.PI / 180;
      const radius = 70;
      return {
        ddd: 0,
        ind: i + 2,
        ty: 4,
        nm: `sparkle_${i}`,
        sr: 1,
        ks: {
          o: { a: 1, k: [
            { t: 20, s: [0], e: [100] },
            { t: 30, s: [100], e: [100] },
            { t: 60, s: [100], e: [0] },
            { t: 75, s: [0] }
          ]},
          r: { a: 1, k: [{ t: 20, s: [0], e: [180] }, { t: 75, s: [180] }] },
          p: { a: 1, k: [
            { t: 20, s: [100, 100, 0], e: [100 + Math.cos(angle) * radius, 100 + Math.sin(angle) * radius, 0] },
            { t: 50, s: [100 + Math.cos(angle) * radius, 100 + Math.sin(angle) * radius, 0] }
          ]},
          a: { a: 0, k: [0, 0, 0] },
          s: { a: 1, k: [
            { t: 20, s: [0, 0, 100], e: [100, 100, 100] },
            { t: 35, s: [100, 100, 100], e: [50, 50, 100] },
            { t: 75, s: [50, 50, 100] }
          ]}
        },
        ao: 0,
        shapes: [{
          ty: "gr",
          it: [
            {
              ty: "sr",
              sy: 1,
              d: 1,
              pt: { a: 0, k: 4 },
              p: { a: 0, k: [0, 0] },
              r: { a: 0, k: 0 },
              ir: { a: 0, k: 3 },
              is: { a: 0, k: 0 },
              or: { a: 0, k: 10 },
              os: { a: 0, k: 0 }
            },
            { ty: "fl", c: { a: 0, k: i % 2 === 0 ? [1, 0.84, 0, 1] : [1, 1, 1, 1] }, o: { a: 0, k: 100 } },
            { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
          ],
          nm: "sparkleShape"
        }],
        ip: 0,
        op: 90,
        st: 0,
        bm: 0
      };
    })
  ]
};

// Level Up animation - arrow going up with burst effect
const levelUpAnimation = {
  v: "5.7.4",
  fr: 30,
  ip: 0,
  op: 60,
  w: 200,
  h: 200,
  nm: "LevelUp",
  ddd: 0,
  assets: [],
  layers: [
    // Arrow
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "arrow",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 1, k: [
          { t: 0, s: [100, 160, 0], e: [100, 80, 0] },
          { t: 25, s: [100, 80, 0], e: [100, 95, 0] },
          { t: 35, s: [100, 95, 0] }
        ]},
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 1, k: [
          { t: 0, s: [80, 80, 100], e: [115, 115, 100] },
          { t: 15, s: [115, 115, 100], e: [100, 100, 100] },
          { t: 25, s: [100, 100, 100] }
        ]}
      },
      ao: 0,
      shapes: [{
        ty: "gr",
        it: [
          {
            ty: "sh",
            d: 1,
            ks: {
              a: 0,
              k: {
                c: true,
                v: [[0, -45], [35, 0], [18, 0], [18, 45], [-18, 45], [-18, 0], [-35, 0]],
                i: [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
                o: [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]]
              }
            }
          },
          { ty: "fl", c: { a: 0, k: [0.3, 0.69, 0.31, 1] }, o: { a: 0, k: 100 } },
          { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
        ],
        nm: "arrowShape"
      }],
      ip: 0,
      op: 60,
      st: 0,
      bm: 0
    },
    // Burst circles
    ...Array.from({ length: 8 }, (_, i) => {
      const angle = (i * 45) * Math.PI / 180;
      return {
        ddd: 0,
        ind: i + 2,
        ty: 4,
        nm: `burst_${i}`,
        sr: 1,
        ks: {
          o: { a: 1, k: [
            { t: 15, s: [0], e: [100] },
            { t: 25, s: [100], e: [0] },
            { t: 45, s: [0] }
          ]},
          r: { a: 0, k: 0 },
          p: { a: 1, k: [
            { t: 15, s: [100, 95, 0], e: [100 + Math.cos(angle) * 55, 95 + Math.sin(angle) * 55, 0] },
            { t: 45, s: [100 + Math.cos(angle) * 55, 95 + Math.sin(angle) * 55, 0] }
          ]},
          a: { a: 0, k: [0, 0, 0] },
          s: { a: 1, k: [
            { t: 15, s: [0, 0, 100], e: [100, 100, 100] },
            { t: 30, s: [100, 100, 100], e: [50, 50, 100] },
            { t: 45, s: [50, 50, 100] }
          ]}
        },
        ao: 0,
        shapes: [{
          ty: "gr",
          it: [
            { ty: "el", d: 1, s: { a: 0, k: [14, 14] }, p: { a: 0, k: [0, 0] } },
            { ty: "fl", c: { a: 0, k: i % 2 === 0 ? [0.3, 0.69, 0.31, 1] : [1, 0.84, 0, 1] }, o: { a: 0, k: 100 } },
            { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
          ],
          nm: "circle"
        }],
        ip: 0,
        op: 60,
        st: 0,
        bm: 0
      };
    })
  ]
};

// Success checkmark animation
const successAnimation = {
  v: "5.7.4",
  fr: 30,
  ip: 0,
  op: 45,
  w: 200,
  h: 200,
  nm: "Success",
  ddd: 0,
  assets: [],
  layers: [
    // Green circle
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "circle",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [100, 100, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 1, k: [
          { t: 0, s: [0, 0, 100], e: [115, 115, 100] },
          { t: 12, s: [115, 115, 100], e: [100, 100, 100] },
          { t: 18, s: [100, 100, 100] }
        ]}
      },
      ao: 0,
      shapes: [{
        ty: "gr",
        it: [
          { ty: "el", d: 1, s: { a: 0, k: [90, 90] }, p: { a: 0, k: [0, 0] } },
          { ty: "fl", c: { a: 0, k: [0.3, 0.69, 0.31, 1] }, o: { a: 0, k: 100 } },
          { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
        ],
        nm: "circleShape"
      }],
      ip: 0,
      op: 45,
      st: 0,
      bm: 0
    },
    // White checkmark
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: "check",
      sr: 1,
      ks: {
        o: { a: 1, k: [{ t: 12, s: [0], e: [100] }, { t: 20, s: [100] }] },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [100, 100, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 1, k: [
          { t: 12, s: [0, 0, 100], e: [115, 115, 100] },
          { t: 22, s: [115, 115, 100], e: [100, 100, 100] },
          { t: 28, s: [100, 100, 100] }
        ]}
      },
      ao: 0,
      shapes: [{
        ty: "gr",
        it: [
          {
            ty: "sh",
            d: 1,
            ks: {
              a: 0,
              k: {
                c: false,
                v: [[-18, 2], [-6, 14], [22, -14]],
                i: [[0, 0], [0, 0], [0, 0]],
                o: [[0, 0], [0, 0], [0, 0]]
              }
            }
          },
          { ty: "st", c: { a: 0, k: [1, 1, 1, 1] }, o: { a: 0, k: 100 }, w: { a: 0, k: 8 }, lc: 2, lj: 2 },
          { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
        ],
        nm: "checkShape"
      }],
      ip: 0,
      op: 45,
      st: 0,
      bm: 0
    }
  ]
};

interface LottieProps {
  className?: string;
  loop?: boolean;
  autoplay?: boolean;
  style?: React.CSSProperties;
}

export function ConfettiAnimation({ className, loop = false, autoplay = true, style }: LottieProps) {
  const lottieRef = useRef<LottieRefCurrentProps>(null);

  useEffect(() => {
    if (lottieRef.current && autoplay) {
      lottieRef.current.play();
    }
  }, [autoplay]);

  return (
    <Lottie
      lottieRef={lottieRef}
      animationData={confettiAnimation}
      loop={loop}
      autoplay={autoplay}
      className={className}
      style={style}
    />
  );
}

export function TrophyAnimation({ className, loop = true, autoplay = true, style }: LottieProps) {
  return (
    <Lottie
      animationData={trophyAnimation}
      loop={loop}
      autoplay={autoplay}
      className={className}
      style={style}
    />
  );
}

export function LevelUpAnimation({ className, loop = false, autoplay = true, style }: LottieProps) {
  return (
    <Lottie
      animationData={levelUpAnimation}
      loop={loop}
      autoplay={autoplay}
      className={className}
      style={style}
    />
  );
}

export function SuccessAnimation({ className, loop = false, autoplay = true, style }: LottieProps) {
  return (
    <Lottie
      animationData={successAnimation}
      loop={loop}
      autoplay={autoplay}
      className={className}
      style={style}
    />
  );
}
