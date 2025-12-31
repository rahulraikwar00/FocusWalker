// components/Avatar.jsx
import { useMemo } from "react";
import { createAvatar } from "@dicebear/core";
import { notionists } from "@dicebear/collection";

// Simple in-memory cache
const avatarCache = new Map();

export function Avatar({ seed = "Anonymous", size = 40 }) {
  const avatarUrl = useMemo(() => {
    const cacheKey = `${seed}-${size}`;

    // Check memory cache (instant!)
    if (avatarCache.has(cacheKey)) {
      return avatarCache.get(cacheKey);
    }

    // Generate new
    const avatar = createAvatar(notionists, {
      seed,
      size,
    });
    const svg = avatar.toString();
    const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

    // Store in memory cache
    avatarCache.set(cacheKey, dataUrl);

    return dataUrl;
  }, [seed, size]);

  return <img src={avatarUrl} alt={`${seed}'s avatar`} />;
}
