import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import {
  Navigation,
  ChevronRight,
  MapPin,
  Users,
  ChevronDown,
  Zap,
  Activity,
  Navigation2,
  Compass,
} from "lucide-react";
import { Button } from "../ui/button";
import { useDrawer } from "@/features/mission/contexts/DrawerContext";
import { useGlobal } from "@/features/mission/contexts/GlobalContext";

const DESTINATIONS = [
  {
    id: "taj",
    name: "Taj Mahal",
    city: "Agra",
    lat: 27.1751,
    lng: 78.0421,
    img: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=300&q=80",
    desc: "The ultimate symbol of eternal focus.",
  },
  {
    id: "hawa",
    name: "Hawa Mahal",
    city: "Jaipur",
    lat: 26.9239,
    lng: 75.8267,
    img: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=300&q=80",
    desc: "The palace of winds and intricate patterns.",
  },
  {
    id: "gate",
    name: "Gateway of India",
    city: "Mumbai",
    lat: 18.922,
    lng: 72.8347,
    img: "https://images.unsplash.com/photo-1580581096469-8afb38d3dbd5?q=80&w=1032&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    desc: "A monumental arch facing the Arabian Sea.",
  },
  {
    id: "qutub",
    name: "Qutub Minar",
    city: "Delhi",
    lat: 28.5245,
    lng: 77.1855,
    img: "https://images.unsplash.com/photo-1748500192752-6f3f441c2a51?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    desc: "Victory tower etched with history.",
  },
  {
    id: "meenakshi",
    name: "Meenakshi Temple",
    city: "Madurai",
    lat: 9.9195,
    lng: 78.1193,
    img: "https://images.unsplash.com/photo-1732883247945-896e63ee644a?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8TWVlbmFrc2hpJTIwVGVtcGxlfGVufDB8fDB8fHww",
    desc: "A masterpiece of Dravidian architecture.",
  },
  {
    id: "golden",
    name: "Golden Temple",
    city: "Amritsar",
    lat: 31.62,
    lng: 74.8765,
    img: "https://images.unsplash.com/photo-1514222134-b57cbb8ce073?auto=format&fit=crop&w=300&q=80",
    desc: "Serenity and gold on the water.",
  },
  {
    id: "amer",
    name: "Amer Fort",
    city: "Jaipur",
    lat: 26.9855,
    lng: 75.8513,
    img: "https://images.pexels.com/photos/11750442/pexels-photo-11750442.jpeg",
    desc: "Majestic fort overlooking the Maota Lake.",
  },
  {
    id: "victoria",
    name: "Victoria Memorial",
    city: "Kolkata",
    lat: 22.5448,
    lng: 88.3426,
    img: "https://plus.unsplash.com/premium_photo-1697730414399-3d4d9ada98bd?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    desc: "Elegant marble architecture from a past era.",
  },
  {
    id: "charminar",
    name: "Charminar",
    city: "Hyderabad",
    lat: 17.3616,
    lng: 78.4747,
    img: "https://images.unsplash.com/photo-1741545979534-02f59c742730?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    desc: "Global icon of the City of Pearls.",
  },
  {
    id: "konark",
    name: "Sun Temple",
    city: "Konark",
    lat: 19.8876,
    lng: 86.0945,
    img: "https://images.unsplash.com/photo-1601815264039-67c8ba1a7f98?q=80&w=627&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    desc: "A massive chariot of stone dedicated to the Sun.",
  },
  {
    id: "ellora",
    name: "Ellora Caves",
    city: "Aurangabad",
    lat: 20.0258,
    lng: 75.178,
    img: "https://plus.unsplash.com/premium_photo-1697729588019-20a1f5a325d1?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    desc: "Monolithic rock-cut monastery-temple caves.",
  },
  {
    id: "ajanta",
    name: "Ajanta Caves",
    city: "Aurangabad",
    lat: 20.5519,
    lng: 75.7033,
    img: "https://plus.unsplash.com/premium_photo-1697729588019-20a1f5a325d1?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    desc: "Buddhist masterpieces carved in rock.",
  },
  {
    id: "mysore",
    name: "Mysore Palace",
    city: "Mysuru",
    lat: 12.3051,
    lng: 76.6552,
    img: "https://plus.unsplash.com/premium_photo-1697730494992-7d5a0c46ea52?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8bXlzb3JlJTIwcGFsYWNlfGVufDB8fDB8fHww",
    desc: "A glowing spectacle of royal grandeur.",
  },
  {
    id: "kedarnath",
    name: "Kedarnath Temple",
    city: "Uttarakhand",
    lat: 30.7352,
    lng: 79.0669,
    img: "https://images.unsplash.com/photo-1612438214708-f428a707dd4e?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    desc: "High-altitude spiritual peak.",
  },
  {
    id: "varanasi",
    name: "Dashashwamedh Ghat",
    city: "Varanasi",
    lat: 25.3076,
    lng: 83.0107,
    img: "https://images.unsplash.com/photo-1736568763783-3a72e7dd52f3?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    desc: "The spiritual heart of the Ganges.",
  },
  {
    id: "rishikesh",
    name: "Laxman Jhula",
    city: "Rishikesh",
    lat: 30.1245,
    lng: 78.3284,
    img: "https://images.unsplash.com/photo-1651056088419-17d8e3d76fe3?q=80&w=1190&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    desc: "Suspension bridge over the holy river.",
  },
  {
    id: "munnar",
    name: "Tea Gardens",
    city: "Munnar",
    lat: 10.0889,
    lng: 77.0595,
    img: "https://plus.unsplash.com/premium_photo-1692049123825-8d43174c9c5c?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8dGVhJTIwZ2FyZGVufGVufDB8fDB8fHww",
    desc: "Emerald hills of the Western Ghats.",
  },
  {
    id: "humayun",
    name: "Humayun's Tomb",
    city: "Delhi",
    lat: 28.5933,
    lng: 77.2507,
    img: "https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?auto=format&fit=crop&w=300&q=80",
    desc: "Precursor to the Taj Mahal.",
  },
  {
    id: "ladakh",
    name: "Pangong Lake",
    city: "Ladakh",
    lat: 33.7595,
    lng: 78.6674,
    img: "https://images.unsplash.com/photo-1536295243470-d7cba4efab7b?q=80&w=1138&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    desc: "Azure waters at the roof of the world.",
  },
];

const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
interface Destination {
  id: string;
  name: string;
  city: string;
  lat: number;
  lng: number;
  img: string;
  desc: string;
  distance?: number; // The '?' means it's optional until calculated
  activeWalkers?: number;
}
export const DestinationSelector = ({ onSelectDestination }: any) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { isOpen, toggle } = useDrawer();
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );
  const { user } = useGlobal();

  useEffect(() => {
    if (user?.location) {
      setUserLocation(user.location);
    }
  }, [user?.location]); // Sync whenever the global location data updates
  const sortedDestinations = useMemo<Destination[]>(() => {
    if (!userLocation) return DESTINATIONS;
    const userLat = userLocation[0]; // Latitude is the first element
    const userLng = userLocation[1]; // Longitude is the second element
    return [...DESTINATIONS]
      .map((dest) => ({
        ...dest,
        distance: calculateDistance(userLat, userLng, dest.lat, dest.lng),

        activeWalkers: Math.floor(Math.random() * 47) + 3,
      }))
      .sort((a, b) => (a.distance || 0) - (b.distance || 0));
  }, [userLocation]);
  const calculateWalkingTime = (distanceKm: number): number => {
    const horizontalTime = distanceKm / 5;
    return Math.round(horizontalTime * 10) / 10;
  };
  const getDifficulty = (hours: number) => {
    // 1 Day or less
    if (hours <= 24 * 5)
      return {
        label: "Easy",
        opacity: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20",
      };

    // Up to 5 Days
    if (hours <= 24 * 10)
      return {
        label: "Moderate",
        opacity: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
      };

    // Up to 10 Days
    if (hours <= 24 * 30)
      return {
        label: "Hard",
        opacity: "bg-orange-600/15 text-orange-400 border border-orange-500/30",
      };

    // 10+ Days
    return {
      label: "God Mode",
      opacity:
        "bg-rose-600/20 text-rose-400 border border-rose-500/40 animate-pulse",
    };
  };
  // Formats 2.5 into "2h 30m" or 0.5 into "30m"
  const formatTime = (totalHours: number) => {
    const days = Math.floor(totalHours / 24);
    const remainingHours = totalHours % 24;
    const h = Math.floor(remainingHours);
    const m = Math.round((remainingHours - h) * 60);

    const parts = [];

    if (days > 0) parts.push(`${days}d`);
    if (h > 0) parts.push(`${h}h`);
    if (m > 0 && days === 0) parts.push(`${m}m`); // Only show minutes if trek is < 1 day

    return parts.length > 0 ? parts.join(" ") : "0m";
  };
  return (
    <div className="w-full max-w-lg mx-auto flex flex-col h-[75vh] md:h-[80vh] bg-[var(--hud-bg)] backdrop-blur-md rounded-2xl overflow-hidden border border-[var(--hud-border)] shadow-2xl">
      {/* Header: More compact, uses theme colors */}
      <div className="shrink-0 px-6 pt-6 pb-4 flex justify-between items-end border-b border-[var(--hud-border)]">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-secondary)] block mb-1">
            Navigation / Nearby
          </span>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Select Trail
          </h2>
        </div>
        <div className="px-3 py-1 rounded-md bg-[var(--accent-glow)] border border-[var(--accent-primary)]/20">
          <p className="text-[10px] font-bold text-[var(--accent-primary)] uppercase">
            {sortedDestinations.length} Active
          </p>
        </div>
      </div>

      {/* List: Improved padding and spacing */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 no-scrollbar">
        <LayoutGroup>
          {sortedDestinations.map((dest) => {
            const isExpanded = expandedId === dest.id;
            const walkingTime = dest.distance
              ? calculateWalkingTime(dest.distance)
              : 0;
            const difficulty = getDifficulty(walkingTime);
            const timeDisplay = formatTime(walkingTime);

            return (
              <motion.div
                layout
                key={dest.id}
                onClick={() => setExpandedId(isExpanded ? null : dest.id)}
                className={`relative overflow-hidden cursor-pointer rounded-xl border transition-all duration-300 ${
                  isExpanded
                    ? "bg-[var(--hud-bg)] border-[var(--accent-primary)]/40 shadow-lg"
                    : "bg-transparent border-[var(--hud-border)] hover:bg-white/5"
                }`}
              >
                <div
                  className={`flex ${
                    isExpanded ? "flex-col" : "flex-row h-20 md:h-24"
                  }`}
                >
                  {/* Image: Scaled down to be less bulky */}
                  <motion.div
                    layout
                    className={`relative overflow-hidden ${
                      isExpanded ? "h-40 md:h-48" : "w-20 md:w-24 shrink-0"
                    }`}
                  >
                    <motion.img
                      layout
                      src={dest.img}
                      className="w-full h-full object-cover grayscale-[0.2] brightness-90"
                    />
                    {isExpanded && (
                      <div className="absolute inset-0 bg-black/20" />
                    )}
                  </motion.div>

                  {/* Content: Tightened layout */}
                  <div className="flex-1 p-3 md:p-4 flex flex-col justify-center">
                    <div className="flex justify-between items-start gap-2">
                      <motion.div layout="position">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[var(--hud-border)] text-[var(--text-secondary)] uppercase">
                            {difficulty.label}
                          </span>
                          <span className="text-[10px] text-[var(--text-secondary)] font-mono">
                            {timeDisplay}
                          </span>
                        </div>
                        <h3
                          className={`font-bold text-[var(--text-primary)] leading-tight ${
                            isExpanded
                              ? "text-lg md:text-xl"
                              : "text-sm md:text-base"
                          }`}
                        >
                          {dest.name}
                        </h3>
                        {!isExpanded && (
                          <p className="text-[11px] text-[var(--text-secondary)] opacity-70">
                            {dest.city}
                          </p>
                        )}
                      </motion.div>

                      {!isExpanded && (
                        <motion.div
                          layout="position"
                          className="text-right shrink-0"
                        >
                          <p className="text-sm md:text-base font-mono font-bold text-[var(--accent-primary)] leading-none">
                            {Math.round(dest.distance || 0)}
                          </p>
                          <p className="text-[8px] font-bold text-[var(--text-secondary)] uppercase mt-1">
                            KM
                          </p>
                        </motion.div>
                      )}
                    </div>

                    {/* Expanded Details: More technical feel */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="mt-4 grid grid-cols-2 gap-4 border-t border-[var(--hud-border)] pt-4"
                        >
                          <div>
                            <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase mb-0.5">
                              Vector
                            </p>
                            <p className="text-sm font-mono text-[var(--text-primary)]">
                              {Math.round(dest.distance || 0)} KM
                            </p>
                          </div>
                          <div>
                            <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase mb-0.5">
                              ETA
                            </p>
                            <p className="text-sm font-mono text-[var(--text-primary)]">
                              {timeDisplay}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Bottom Actions for Expanded State */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-4 pb-4"
                    >
                      <p className="text-xs leading-relaxed text-(--text-secondary) mb-4 pb-4 border-t border-(--hud-border) pt-3">
                        {dest.desc}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          onClick={(e: any) => {
                            e.stopPropagation();
                            toggle();
                            onSelectDestination(dest);
                          }}
                          className="flex-1 py-3 bg-(--accent-primary) text-black rounded-lg text-xs font-black uppercase tracking-tighter hover:scale-[1.02] active:scale-95 transition-transform"
                        >
                          Lock Coordinates
                        </Button>
                        {/* <Button className="p-3 bg-[var(--hud-bg)] border border-[var(--hud-border)] text-[var(--text-primary)] rounded-lg hover:bg-white/5">
                          <Compass size={18} />
                        </Button> */}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </LayoutGroup>
      </div>
    </div>
  );
};
