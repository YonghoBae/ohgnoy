import Image from "next/image";
import { Pokemon } from "pokenode-ts";
import { cn } from "@/lib/utils";
import { getPixelSpriteUrl } from "@/lib/pokemon/spriteUrl";

export { getPixelSpriteUrl } from "@/lib/pokemon/spriteUrl";

interface PixelSpriteProps {
  pokemon?: Pick<Pokemon, "sprites">;
  spriteUrl?: string;
  alt: string;
  size?: number;
  fill?: boolean;
  priority?: boolean;
  className?: string;
}

export default function PixelSprite({
  pokemon,
  spriteUrl,
  alt,
  size = 96,
  fill = false,
  priority,
  className,
}: PixelSpriteProps) {
  const src = spriteUrl ?? (pokemon ? getPixelSpriteUrl(pokemon) : "");
  if (!src) return null;

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        style={{ imageRendering: "pixelated" }}
        className={cn("object-contain", className)}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      priority={priority}
      style={{ imageRendering: "pixelated" }}
      className={cn("object-contain", className)}
    />
  );
}
