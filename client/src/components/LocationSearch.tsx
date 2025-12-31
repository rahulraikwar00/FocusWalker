import { Search, MapPin, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LocationSearchProps, SearchResult } from "@/types";

export const LocationSearch = ({
  searchQuery,
  setSearchQuery,
  points,
  searchLocation,
  onLocationSelect,
}: LocationSearchProps) => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    const locations = await searchLocation(searchQuery);
    setResults(locations);
    setIsSearching(false);
  };

  const selectLocation = (loc: SearchResult) => {
    onLocationSelect(loc);
    setResults([]); // Clear list after selection
    setSearchQuery(""); // Reset input
  };

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setResults([]);
    }
  }, [searchQuery]);

  return (
    // Change the root div to this:
    <div className="absolute top-28 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2.5rem)] max-w-md pointer-events-auto">
      <div className="relative group">
        {/* Input Field */}
        <div
          className={`bg-hud backdrop-blur-md border transition-all duration-300 rounded-2xl p-1 flex items-center gap-2 ${
            results.length > 0
              ? "border-(--accent-primary)/50 shadow-[0_0_20px_var(--accent-glow)]"
              : "border-(--hud-border)"
          }`}
        >
          {isSearching ? (
            <Loader2
              size={18}
              className="ml-4 animate-spin text-(--accent-primary)"
            />
          ) : (
            <Search
              size={18}
              className="ml-4 text-(--text-secondary) opacity-40"
            />
          )}

          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onBlur={() => {
              const timer = setTimeout(() => {
                setResults((prev) => (prev.length > 0 ? [] : prev));
              }, 150);
              return () => clearTimeout(timer);
            }}
            onKeyDown={async (e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (searchQuery.trim().length > 1) {
                  await handleSearch();
                }
              }
            }}
            placeholder={
              !points.start
                ? "Search start location..."
                : "Search destination..."
            }
            className="bg-transparent border-none outline-none text-sm w-full py-3 text-(--text-primary) placeholder:text-(--text-secondary)/80"
          />
        </div>

        {/* Results List */}
        <AnimatePresence>
          {results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 8 }}
              exit={{ opacity: 0, y: 4 }}
              // FIX: Stop scroll events from reaching the map/body
              onWheel={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              className="absolute top-full left-0 w-full bg-hud/95 backdrop-blur-2xl border border-(--hud-border) rounded-2xl shadow-2xl overflow-hidden "
            >
              <div
                className="max-h-60 overflow-y-auto overscroll-contain no-scrollbar"
                // Extra safety for mobile touch
                style={{ overscrollBehavior: "contain" }}
              >
                {results.map((loc, index) => (
                  <button
                    key={index}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      onLocationSelect(loc);
                      setResults([]);
                      setSearchQuery("");
                    }}
                    className="w-full px-5 py-4 flex items-center gap-4 hover:bg-(--accent-primary)/10 border-b border-(--hud-border) last:border-none text-left"
                  >
                    <MapPin size={16} className="text-(--accent-primary)" />
                    <div>
                      <p className="text-sm font-bold text-(--text-primary)">
                        {loc.name}
                      </p>
                      <p className="text-[10px] text-(--text-secondary) opacity-50 mt-0.5">
                        {loc.latlng.lat.toFixed(3)}, {loc.latlng.lng.toFixed(3)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
