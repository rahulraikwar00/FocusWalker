import { Search, MapPin, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SearchResult } from "@/types/types";
import { useGlobal } from "@/features/mission/contexts/GlobalContext";

export const LocationSearch = ({
  points,
  searchLocation,
  onLocationSelect,
}: any) => {
  // 1. Pull search state directly from Global Context
  const { searchQuery, setUI } = useGlobal();

  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Helper to update global search query
  const updateQuery = (val: string) => setUI({ searchQuery: val });

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const locations = await searchLocation(searchQuery);
      setResults(locations);
    } finally {
      setIsSearching(false);
    }
  };

  const selectLocation = (loc: SearchResult) => {
    onLocationSelect(loc);
    setResults([]);
    updateQuery(""); // Clear global search state
  };

  // Reset results if query is cleared
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setResults([]);
    }
  }, [searchQuery]);

  return (
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
            onChange={(e) => updateQuery(e.target.value)}
            onBlur={() => {
              // Delay clear so the click on a result actually registers
              setTimeout(() => setResults([]), 200);
            }}
            onKeyDown={async (e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                await handleSearch();
              }
            }}
            placeholder={
              !points.start ? "Target: Origin Location" : "Target: Destination"
            }
            className="bg-transparent border-none outline-none text-sm w-full py-3 text-(--text-primary) placeholder:text-(--text-primary)/40 italic font-medium"
          />
        </div>

        {/* Results List */}
        <AnimatePresence>
          {results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 8 }}
              exit={{ opacity: 0, y: 4 }}
              onWheel={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              className="absolute top-full left-0 w-full bg-hud/95 backdrop-blur-2xl border border-(--hud-border) rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="max-h-60 overflow-y-auto overscroll-contain no-scrollbar">
                {results.map((loc, index) => (
                  <button
                    key={`${loc.name}-${index}`}
                    onClick={() => selectLocation(loc)}
                    className="w-full px-5 py-4 flex items-center gap-4 hover:bg-(--accent-primary)/10 border-b border-(--hud-border) last:border-none text-left transition-colors"
                  >
                    <div className="p-2 bg-(--accent-primary)/10 rounded-lg">
                      <MapPin size={14} className="text-(--accent-primary)" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-(--text-primary)">
                        {loc.name}
                      </p>
                      <p className="text-[10px] text-(--text-secondary) opacity-50 mt-0.5 tracking-widest font-mono uppercase">
                        LOC: {loc.latlng.lat.toFixed(4)} /{" "}
                        {loc.latlng.lng.toFixed(4)}
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
