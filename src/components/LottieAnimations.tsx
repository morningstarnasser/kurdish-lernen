"use client";

import { useEffect, useState } from "react";
import Lottie from "lottie-react";

// Embedded Lottie animation data (optimized, minimal versions)

// Confetti celebration animation
const confettiAnimation = {
  v: "5.7.4",
  fr: 60,
  ip: 0,
  op: 60,
  w: 400,
  h: 400,
  nm: "Confetti",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "confetti",
      sr: 1,
      ks: {
        o: { a: 1, k: [{ t: 0, s: [100] }, { t: 60, s: [0] }] },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [200, 200, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] }
      },
      ao: 0,
      shapes: Array.from({ length: 20 }, (_, i) => ({
        ty: "gr",
        it: [
          {
            ty: "rc",
            d: 1,
            s: { a: 0, k: [8, 8] },
            p: { a: 0, k: [0, 0] },
            r: { a: 0, k: 2 },
            nm: "rect"
          },
          {
            ty: "fl",
            c: { a: 0, k: [
              [0.345, 0.8, 0.012, 1], // Green
              [0.11, 0.69, 0.965, 1], // Blue
              [1, 0.757, 0.027, 1],   // Yellow
              [0.992, 0.271, 0.271, 1], // Red
              [0.608, 0.318, 0.878, 1]  // Purple
            ][i % 5] },
            o: { a: 0, k: 100 },
            nm: "fill"
          },
          {
            ty: "tr",
            p: {
              a: 1,
              k: [
                { t: 0, s: [0, 0], e: [(Math.random() - 0.5) * 300, -200 + Math.random() * 100] },
                { t: 30, s: [(Math.random() - 0.5) * 300, -200 + Math.random() * 100], e: [(Math.random() - 0.5) * 350, 250] },
                { t: 60, s: [(Math.random() - 0.5) * 350, 250] }
              ]
            },
            a: { a: 0, k: [0, 0] },
            s: { a: 0, k: [100, 100] },
            r: {
              a: 1,
              k: [
                { t: 0, s: [0], e: [360 * (Math.random() > 0.5 ? 1 : -1)] },
                { t: 60, s: [360 * (Math.random() > 0.5 ? 1 : -1)] }
              ]
            },
            o: { a: 0, k: 100 }
          }
        ],
        nm: `piece${i}`
      })),
      ip: 0,
      op: 60,
      st: 0,
      bm: 0
    }
  ]
};

// Trophy/Star celebration
const trophyAnimation = {
  v: "5.7.4",
  fr: 60,
  ip: 0,
  op: 90,
  w: 200,
  h: 200,
  nm: "Trophy",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "star",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 1, k: [{ t: 0, s: [0], e: [10] }, { t: 45, s: [10], e: [-10] }, { t: 90, s: [-10] }] },
        p: { a: 1, k: [{ t: 0, s: [100, 120, 0], e: [100, 90, 0] }, { t: 30, s: [100, 90, 0] }] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 1, k: [{ t: 0, s: [0, 0, 100], e: [110, 110, 100] }, { t: 20, s: [110, 110, 100], e: [100, 100, 100] }, { t: 30, s: [100, 100, 100] }] }
      },
      ao: 0,
      shapes: [
        {
          ty: "gr",
          it: [
            {
              ty: "sr",
              sy: 1,
              d: 1,
              pt: { a: 0, k: 5 },
              p: { a: 0, k: [0, 0] },
              r: { a: 0, k: 0 },
              ir: { a: 0, k: 20 },
              is: { a: 0, k: 0 },
              or: { a: 0, k: 50 },
              os: { a: 0, k: 0 },
              nm: "star"
            },
            {
              ty: "fl",
              c: { a: 0, k: [1, 0.757, 0.027, 1] },
              o: { a: 0, k: 100 },
              nm: "fill"
            },
            {
              ty: "tr",
              p: { a: 0, k: [0, 0] },
              a: { a: 0, k: [0, 0] },
              s: { a: 0, k: [100, 100] },
              r: { a: 0, k: 0 },
              o: { a: 0, k: 100 }
            }
          ],
          nm: "starGroup"
        }
      ],
      ip: 0,
      op: 90,
      st: 0,
      bm: 0
    },
    // Sparkles
    ...Array.from({ length: 8 }, (_, i) => ({
      ddd: 0,
      ind: i + 2,
      ty: 4,
      nm: `sparkle${i}`,
      sr: 1,
      ks: {
        o: { a: 1, k: [{ t: 15, s: [0] }, { t: 25, s: [100] }, { t: 50, s: [100] }, { t: 70, s: [0] }] },
        r: { a: 0, k: 0 },
        p: {
          a: 1,
          k: [
            { t: 15, s: [100, 90, 0], e: [100 + Math.cos(i * Math.PI / 4) * 60, 90 + Math.sin(i * Math.PI / 4) * 60, 0] },
            { t: 50, s: [100 + Math.cos(i * Math.PI / 4) * 60, 90 + Math.sin(i * Math.PI / 4) * 60, 0], e: [100 + Math.cos(i * Math.PI / 4) * 80, 90 + Math.sin(i * Math.PI / 4) * 80, 0] },
            { t: 70, s: [100 + Math.cos(i * Math.PI / 4) * 80, 90 + Math.sin(i * Math.PI / 4) * 80, 0] }
          ]
        },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 1, k: [{ t: 15, s: [0, 0, 100] }, { t: 30, s: [100, 100, 100] }, { t: 70, s: [50, 50, 100] }] }
      },
      ao: 0,
      shapes: [
        {
          ty: "gr",
          it: [
            {
              ty: "sr",
              sy: 1,
              d: 1,
              pt: { a: 0, k: 4 },
              p: { a: 0, k: [0, 0] },
              r: { a: 0, k: 0 },
              ir: { a: 0, k: 2 },
              is: { a: 0, k: 0 },
              or: { a: 0, k: 8 },
              os: { a: 0, k: 0 },
              nm: "sparkle"
            },
            {
              ty: "fl",
              c: { a: 0, k: i % 2 === 0 ? [1, 0.757, 0.027, 1] : [1, 1, 1, 1] },
              o: { a: 0, k: 100 },
              nm: "fill"
            },
            {
              ty: "tr",
              p: { a: 0, k: [0, 0] },
              a: { a: 0, k: [0, 0] },
              s: { a: 0, k: [100, 100] },
              r: { a: 1, k: [{ t: 15, s: [0], e: [180] }, { t: 70, s: [180] }] },
              o: { a: 0, k: 100 }
            }
          ],
          nm: `sparkleGroup${i}`
        }
      ],
      ip: 0,
      op: 90,
      st: 0,
      bm: 0
    }))
  ]
};

// Level Up animation with arrow going up
const levelUpAnimation = {
  v: "5.7.4",
  fr: 60,
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
        p: { a: 1, k: [{ t: 0, s: [100, 150, 0], e: [100, 80, 0] }, { t: 30, s: [100, 80, 0], e: [100, 90, 0] }, { t: 45, s: [100, 90, 0] }] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 1, k: [{ t: 0, s: [80, 80, 100], e: [110, 110, 100] }, { t: 20, s: [110, 110, 100], e: [100, 100, 100] }, { t: 30, s: [100, 100, 100] }] }
      },
      ao: 0,
      shapes: [
        {
          ty: "gr",
          it: [
            {
              ty: "sh",
              d: 1,
              ks: {
                a: 0,
                k: {
                  c: true,
                  v: [[0, -40], [30, 0], [15, 0], [15, 40], [-15, 40], [-15, 0], [-30, 0]],
                  i: [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
                  o: [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]]
                }
              },
              nm: "arrow"
            },
            {
              ty: "fl",
              c: { a: 0, k: [0.345, 0.8, 0.012, 1] },
              o: { a: 0, k: 100 },
              nm: "fill"
            },
            {
              ty: "tr",
              p: { a: 0, k: [0, 0] },
              a: { a: 0, k: [0, 0] },
              s: { a: 0, k: [100, 100] },
              r: { a: 0, k: 0 },
              o: { a: 0, k: 100 }
            }
          ],
          nm: "arrowGroup"
        }
      ],
      ip: 0,
      op: 60,
      st: 0,
      bm: 0
    },
    // Burst circles
    ...Array.from({ length: 6 }, (_, i) => ({
      ddd: 0,
      ind: i + 2,
      ty: 4,
      nm: `burst${i}`,
      sr: 1,
      ks: {
        o: { a: 1, k: [{ t: 10, s: [0] }, { t: 20, s: [100] }, { t: 45, s: [0] }] },
        r: { a: 0, k: 0 },
        p: {
          a: 1,
          k: [
            { t: 10, s: [100, 90, 0], e: [100 + Math.cos(i * Math.PI / 3) * 50, 90 + Math.sin(i * Math.PI / 3) * 50, 0] },
            { t: 45, s: [100 + Math.cos(i * Math.PI / 3) * 50, 90 + Math.sin(i * Math.PI / 3) * 50, 0] }
          ]
        },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 1, k: [{ t: 10, s: [0, 0, 100] }, { t: 25, s: [100, 100, 100] }, { t: 45, s: [60, 60, 100] }] }
      },
      ao: 0,
      shapes: [
        {
          ty: "gr",
          it: [
            {
              ty: "el",
              d: 1,
              s: { a: 0, k: [12, 12] },
              p: { a: 0, k: [0, 0] },
              nm: "circle"
            },
            {
              ty: "fl",
              c: { a: 0, k: i % 2 === 0 ? [0.345, 0.8, 0.012, 1] : [0.11, 0.69, 0.965, 1] },
              o: { a: 0, k: 100 },
              nm: "fill"
            },
            {
              ty: "tr",
              p: { a: 0, k: [0, 0] },
              a: { a: 0, k: [0, 0] },
              s: { a: 0, k: [100, 100] },
              r: { a: 0, k: 0 },
              o: { a: 0, k: 100 }
            }
          ],
          nm: `burstGroup${i}`
        }
      ],
      ip: 0,
      op: 60,
      st: 0,
      bm: 0
    }))
  ]
};

// Success checkmark animation
const successAnimation = {
  v: "5.7.4",
  fr: 60,
  ip: 0,
  op: 60,
  w: 200,
  h: 200,
  nm: "Success",
  ddd: 0,
  assets: [],
  layers: [
    // Circle
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
        s: { a: 1, k: [{ t: 0, s: [0, 0, 100], e: [110, 110, 100] }, { t: 15, s: [110, 110, 100], e: [100, 100, 100] }, { t: 25, s: [100, 100, 100] }] }
      },
      ao: 0,
      shapes: [
        {
          ty: "gr",
          it: [
            {
              ty: "el",
              d: 1,
              s: { a: 0, k: [80, 80] },
              p: { a: 0, k: [0, 0] },
              nm: "circle"
            },
            {
              ty: "fl",
              c: { a: 0, k: [0.345, 0.8, 0.012, 1] },
              o: { a: 0, k: 100 },
              nm: "fill"
            },
            {
              ty: "tr",
              p: { a: 0, k: [0, 0] },
              a: { a: 0, k: [0, 0] },
              s: { a: 0, k: [100, 100] },
              r: { a: 0, k: 0 },
              o: { a: 0, k: 100 }
            }
          ],
          nm: "circleGroup"
        }
      ],
      ip: 0,
      op: 60,
      st: 0,
      bm: 0
    },
    // Checkmark
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: "check",
      sr: 1,
      ks: {
        o: { a: 1, k: [{ t: 15, s: [0] }, { t: 25, s: [100] }] },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [100, 100, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 1, k: [{ t: 15, s: [0, 0, 100] }, { t: 30, s: [100, 100, 100] }] }
      },
      ao: 0,
      shapes: [
        {
          ty: "gr",
          it: [
            {
              ty: "sh",
              d: 1,
              ks: {
                a: 0,
                k: {
                  c: false,
                  v: [[-15, 5], [-5, 15], [20, -15]],
                  i: [[0, 0], [0, 0], [0, 0]],
                  o: [[0, 0], [0, 0], [0, 0]]
                }
              },
              nm: "check"
            },
            {
              ty: "st",
              c: { a: 0, k: [1, 1, 1, 1] },
              o: { a: 0, k: 100 },
              w: { a: 0, k: 6 },
              lc: 2,
              lj: 2,
              nm: "stroke"
            },
            {
              ty: "tr",
              p: { a: 0, k: [0, 0] },
              a: { a: 0, k: [0, 0] },
              s: { a: 0, k: [100, 100] },
              r: { a: 0, k: 0 },
              o: { a: 0, k: 100 }
            }
          ],
          nm: "checkGroup"
        }
      ],
      ip: 0,
      op: 60,
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
  return (
    <Lottie
      animationData={confettiAnimation}
      loop={loop}
      autoplay={autoplay}
      className={className}
      style={style}
    />
  );
}

export function TrophyAnimation({ className, loop = false, autoplay = true, style }: LottieProps) {
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

// Combined celebration component
interface CelebrationProps {
  type: "complete" | "levelUp" | "correct" | "streak";
  className?: string;
}

export function CelebrationAnimation({ type, className }: CelebrationProps) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className={`pointer-events-none ${className || ""}`}>
      {type === "complete" && (
        <div className="relative">
          <ConfettiAnimation className="absolute inset-0 w-full h-full" />
          <TrophyAnimation className="w-32 h-32 mx-auto" />
        </div>
      )}
      {type === "levelUp" && (
        <LevelUpAnimation className="w-40 h-40 mx-auto" />
      )}
      {type === "correct" && (
        <SuccessAnimation className="w-24 h-24 mx-auto" />
      )}
      {type === "streak" && (
        <div className="relative">
          <TrophyAnimation className="w-28 h-28 mx-auto" loop />
        </div>
      )}
    </div>
  );
}
