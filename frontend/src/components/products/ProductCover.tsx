"use client";

import { useState } from "react";
import Image from "next/image";
import { PawPrint } from "lucide-react";

interface ProductCoverProps {
  src?: string;
  alt: string;
  title: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}

export function ProductCover({ src, alt, title, sizes, priority, className }: ProductCoverProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-border/30 p-4 text-center">
        <PawPrint className="size-6 text-muted" aria-hidden />
        <span className="line-clamp-4 font-display text-sm leading-snug text-muted">{title}</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes}
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
