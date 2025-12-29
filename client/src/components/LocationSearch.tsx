import { Search, MapPin, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SearchResult {
  name: string;
  latlng: L.LatLng;
}

interface LocationSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  points: { start: L.LatLng | null; end: L.LatLng | null };
  // Modified to return a list of results
  searchLocation: (query: string) => Promise<SearchResult[]>;
  onLocationSelect: (location: SearchResult) => void;
}

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
    <div className="absolute top-28 left-1/2 -translate-x-1/2 z-2000 w-[calc(100%-2.5rem)] max-w-md">
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
              setTimeout(() => setResults([]), 200);
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
            className="bg-transparent border-none outline-none text-sm w-full py-3 text-(--text-primary) placeholder:text-(--text-secondary)/50"
          />
        </div>

        {/* Results List */}
        <AnimatePresence>
          {results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 5 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 w-full bg-hud backdrop-blur-xl border border-(--hud-border) rounded-2xl overflow-hidden mt-2 shadow-2xl"
            >
              <div className="max-h-75 overflow-y-auto custom-scrollbar">
                {results.map((loc, index) => (
                  <button
                    key={`${loc.name}-${index}`}
                    onClick={() => selectLocation(loc)}
                    className="w-full px-5 py-4 flex items-start gap-4 hover:bg-(--accent-primary)/10 border-b border-(--hud-border) last:border-none transition-colors group text-left"
                  >
                    <MapPin
                      size={16}
                      className="mt-1 text-(--text-secondary) group-hover:text-(--accent-primary) transition-colors"
                    />
                    <div>
                      <p className="text-sm font-bold text-(--text-primary) group-hover:text-(--accent-primary) transition-colors line-clamp-1">
                        {loc.name}
                      </p>
                      <p className="text-[10px] text-(--text-secondary) opacity-60 uppercase tracking-widest mt-0.5 font-mono">
                        COORD: {loc.latlng.lat.toFixed(4)},{" "}
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
