"use client";

import { memo, useMemo, useRef } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { cn } from "../../lib/utils";

type ImagePosition = {
  src: string;
  position:
    | "top-left"
    | "top-right"
    | "mid-left"
    | "mid-right"
    | "bottom-left"
    | "bottom-right"
    | "far-left"
    | "far-right";
  depth: number;
  delay: number;
};

const positionStyles: Record<
  ImagePosition["position"],
  { top: string; left?: string; right?: string }
> = {
  "top-left": { top: "8%", left: "4%" },
  "top-right": { top: "8%", right: "4%" },
  "mid-left": { top: "38%", left: "6%" },
  "mid-right": { top: "38%", right: "6%" },
  "bottom-left": { top: "68%", left: "4%" },
  "bottom-right": { top: "68%", right: "4%" },
  "far-left": { top: "52%", left: "2%" },
  "far-right": { top: "52%", right: "2%" },
};

const positionOrder: ImagePosition["position"][] = [
  "top-left",
  "top-right",
  "mid-left",
  "mid-right",
  "bottom-left",
  "bottom-right",
  "far-left",
  "far-right",
];

type DepthVariant = "default" | "edge-focus";

const depthValuesByVariant: Record<DepthVariant, number[]> = {
  default: [0.3, 0.35, 0.9, 0.85, 0.4, 0.45, 0.25, 0.2],
  "edge-focus": [0.85, 0.9, 0.3, 0.35, 0.8, 0.85, 0.4, 0.45],
};

const SPRING_CONFIG = { damping: 25, stiffness: 120 };

export interface ParallaxHeroImagesProps {
  images: string[];
  className?: string;
  imageClassName?: string;
  variant?: DepthVariant;
}

export const ParallaxHeroImages = ({
  images,
  className,
  imageClassName,
  variant = "default",
}: ParallaxHeroImagesProps) => {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const reduceMotion = useReducedMotion();
  const smoothMouseX = useSpring(mouseX, SPRING_CONFIG);
  const smoothMouseY = useSpring(mouseY, SPRING_CONFIG);

  const positions = useMemo(() => {
    const limitedImages = images.slice(0, 8);
    const depthValues = depthValuesByVariant[variant];
    return limitedImages.map((src, index) => ({
      src,
      position: positionOrder[index],
      depth: depthValues[index],
      delay: index * 0.12,
    }));
  }, [images, variant]);

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (reduceMotion || !surfaceRef.current) return;
    const bounds = surfaceRef.current.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    const y = ((event.clientY - bounds.top) / bounds.height) * 2 - 1;
    mouseX.set(Math.max(-1, Math.min(1, x)));
    mouseY.set(Math.max(-1, Math.min(1, y)));
  };
  const resetParallax = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div
      ref={surfaceRef}
      className={cn("absolute inset-0 overflow-hidden", className)}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetParallax}
      aria-hidden="true"
    >
      {positions.map((position, index) => (
        <ParallaxImage
          key={`${position.src}-${index}`}
          src={position.src}
          position={position.position}
          depth={position.depth}
          delay={position.delay}
          imageClassName={imageClassName}
          smoothMouseX={smoothMouseX}
          smoothMouseY={smoothMouseY}
          reduceMotion={Boolean(reduceMotion)}
        />
      ))}
    </div>
  );
};

interface ParallaxImageProps extends ImagePosition {
  imageClassName?: string;
  smoothMouseX: MotionValue<number>;
  smoothMouseY: MotionValue<number>;
  reduceMotion: boolean;
}

const ParallaxImage = memo(function ParallaxImage({
  src,
  position,
  depth,
  delay,
  imageClassName,
  smoothMouseX,
  smoothMouseY,
  reduceMotion,
}: ParallaxImageProps) {
  const maxOffset = 40;
  const translateX = useTransform(
    smoothMouseX,
    [-1, 1],
    reduceMotion ? [0, 0] : [-maxOffset * depth, maxOffset * depth],
  );
  const translateY = useTransform(
    smoothMouseY,
    [-1, 1],
    reduceMotion ? [0, 0] : [-maxOffset * depth, maxOffset * depth],
  );
  const positionStyle = positionStyles[position];

  return (
    <motion.div
      className="absolute"
      style={{
        top: positionStyle.top,
        left: positionStyle.left,
        right: positionStyle.right,
        x: translateX,
        y: translateY,
        zIndex: Math.round(depth * 10),
      }}
      initial={
        reduceMotion ? false : { opacity: 0, filter: "blur(20px)", scale: 0.9 }
      }
      animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
      transition={{
        duration: reduceMotion ? 0 : 0.8,
        delay: reduceMotion ? 0 : delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      <img
        src={src}
        alt=""
        loading="lazy"
        decoding="async"
        className={cn(
          "aspect-4/3 h-20 w-32 rounded-lg object-cover shadow-sm ring-1 ring-black/10 sm:h-40 sm:w-56 md:h-52 md:w-80 dark:ring-white/10",
          imageClassName,
        )}
      />
    </motion.div>
  );
});
