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
  // Define the type as a tuple of numbers or null
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );
  const { user } = useGlobal();

  useEffect(() => {
    // We sync when the component "notices" a location is available
    // This ensures the data is ready before the user even looks at it
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
    <div className="w-full max-w-2xl  flex flex-col h-[85vh] bg-white dark:bg-zinc-950 rounded-[2rem] overflow-hidden border border-zinc-100 dark:border-zinc-800 shadow-xl">
      {/* Header */}
      <div className="shrink-0 px-8 pt-8 pb-6 flex justify-between items-end">
        <div>
          <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500 block mb-1">
            Explorer
          </span>
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Nearby Trails
          </h2>
        </div>
        <div className="px-4 py-1.5 rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
          <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            {sortedDestinations.length} routes found
          </p>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-6 space-y-4 no-scrollbar pb-8 pt-2">
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
                className={`relative overflow-hidden cursor-pointer rounded-3xl transition-all duration-500 ${
                  isExpanded
                    ? "bg-zinc-50 dark:bg-zinc-900 shadow-inner border-transparent"
                    : "bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
              >
                <div
                  className={`flex ${
                    isExpanded ? "flex-col" : "flex-row h-28"
                  }`}
                >
                  {/* Image */}
                  <motion.div
                    layout
                    className={`relative overflow-hidden transform-gpu ${
                      isExpanded ? "h-56" : "w-28 shrink-0"
                    }`}
                  >
                    <motion.img
                      layout
                      src={dest.img}
                      className="w-full h-full object-cover"
                    />
                    {isExpanded && (
                      <div className="absolute inset-0 bg-black/10" />
                    )}
                  </motion.div>

                  {/* Content */}
                  <div className="flex-1 p-5 flex flex-col justify-center">
                    <div className="flex justify-between items-start">
                      <motion.div layout="position">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                              isExpanded
                                ? "bg-white dark:bg-zinc-800"
                                : "bg-zinc-100 dark:bg-zinc-800"
                            } border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400`}
                          >
                            {difficulty.label}
                          </span>
                          <span className="text-xs text-zinc-400">
                            • {timeDisplay}
                          </span>
                        </div>

                        <h3
                          className={`font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight transition-all ${
                            isExpanded ? "text-2xl" : "text-lg"
                          }`}
                        >
                          {dest.name}
                        </h3>
                        {!isExpanded && (
                          <p className="text-sm text-zinc-500">{dest.city}</p>
                        )}
                      </motion.div>

                      {!isExpanded && (
                        <motion.div layout="position" className="text-right">
                          <p className="text-xl font-light text-zinc-900 dark:text-zinc-100 leading-none">
                            {Math.round(dest.distance || 0)}
                          </p>
                          <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider mt-1">
                            KM
                          </p>
                        </motion.div>
                      )}
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="mt-6 flex gap-8 border-t border-zinc-200/50 dark:border-zinc-800 pt-5"
                        >
                          <div>
                            <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wide mb-1">
                              Distance
                            </p>
                            <p className="text-base font-medium text-zinc-900 dark:text-zinc-100">
                              {Math.round(dest.distance || 0)}km
                            </p>
                          </div>
                          <div className="border-l border-zinc-200 dark:border-zinc-800 pl-8">
                            <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wide mb-1">
                              Walking Time
                            </p>
                            <p className="text-base font-medium text-zinc-900 dark:text-zinc-100">
                              {timeDisplay}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                    >
                      <div className="px-5 pb-6">
                        <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400 mb-6 pt-4 border-t border-zinc-200/50 dark:border-zinc-800">
                          {dest.desc}
                        </p>

                        <div className="flex items-center gap-2 mb-6 text-zinc-400">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span className="text-xs">
                            {dest.activeWalkers} others are walking here now
                          </span>
                        </div>

                        <div className="flex gap-3">
                          <Button
                            onClick={(e: any) => {
                              if (isOpen) toggle();
                              e.stopPropagation();
                              onSelectDestination(dest);
                            }}
                            className="flex-1 py-6 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 rounded-2xl text-sm font-medium transition-transform active:scale-[0.98]"
                          >
                            Begin this journey
                          </Button>
                          <Button className="p-4 bg-white dark:bg-zinc-800 rounded-2xl text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 active:scale-[0.98] transition-transform">
                            <Compass size={20} strokeWidth={1.5} />
                          </Button>
                        </div>
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
