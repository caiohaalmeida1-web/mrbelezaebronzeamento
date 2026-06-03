import Image from "next/image";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

type LogoVariant = "round-color" | "horizontal-color" | "round-mono";

interface LogoProps {
  variant?: LogoVariant;
  size?: number;
  width?: number;
  height?: number;
  className?: string;
  blend?: boolean;
  priority?: boolean;
  alt?: string;
  rounded?: boolean;
  style?: CSSProperties;
}

const SOURCES: Record<LogoVariant, string> = {
  "round-color": "/images/logo-redondo-color.jpeg",
  "horizontal-color": "/images/logo-horizontal-color.jpeg",
  "round-mono": "/images/logo-redondo.jpeg",
};

export function Logo({
  variant = "round-color",
  size = 64,
  width: widthProp,
  height: heightProp,
  className,
  blend = false,
  priority = false,
  alt = "Mércia Regina · Beleza e Bronzeamento",
  rounded,
  style,
}: LogoProps) {
  const src = SOURCES[variant];
  const isHorizontal = variant === "horizontal-color";

  const width = widthProp ?? (isHorizontal ? size * 2 : size);
  const height = heightProp ?? size;

  const isRounded = rounded ?? (variant === "round-color");

  const composedStyle: CSSProperties = {
    ...(blend ? { mixBlendMode: "multiply" } : {}),
    ...style,
  };

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      sizes={`${width}px`}
      style={composedStyle}
      className={cn(
        "object-contain",
        isHorizontal && "h-auto w-auto",
        isRounded && "rounded-full",
        blend && "logo-blend",
        className
      )}
    />
  );
}
