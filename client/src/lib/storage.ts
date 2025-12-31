// Define keys as constants to avoid typos
const KEYS = {
  USER: "fw_user_dossier",
  SESSION: "fw_active_session",
  CHECKPOINTS: "fw_secured_checkpoints", // Renamed from TENTS
  SETTINGS: "fw_sys_config",
  ACTIVE_ROUTE: "fw_active_route",
};

export const storage = {
  // --- USER DATA (XP, Level, Name) ---
  saveUser: (data: any) =>
    localStorage.setItem(KEYS.USER, JSON.stringify(data)),
  getUser: () =>
    JSON.parse(
      localStorage.getItem(KEYS.USER) ||
        '{"xp": 0, "level": 1, "rank": "RECRUIT"}'
    ),

  // --- ROUTE & SESSION (KM, Current Path) ---
  saveSession: (data: any) =>
    localStorage.setItem(KEYS.SESSION, JSON.stringify(data)),
  getSession: () => JSON.parse(localStorage.getItem(KEYS.SESSION) || "null"),
  clearSession: () => localStorage.removeItem(KEYS.SESSION),

  // --- CHECKPOINTS (Nodes secured on the map) ---
  saveCheckpoints: (points: any[]) =>
    localStorage.setItem(KEYS.CHECKPOINTS, JSON.stringify(points)),

  getCheckpoints: () =>
    JSON.parse(localStorage.getItem(KEYS.CHECKPOINTS) || "[]"),

  // Utility to check if a specific checkpoint is already secured
  isCheckpointSecured: (id: string) => {
    const secured = JSON.parse(localStorage.getItem(KEYS.CHECKPOINTS) || "[]");
    return secured.some((cp: any) => cp.id === id);
  },

  // --- SYSTEM SETTINGS ---
  saveSettings: (cfg: any) =>
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(cfg)),
  getSettings: () =>
    JSON.parse(
      localStorage.getItem(KEYS.SETTINGS) ||
        '{"haptics": true, "wakeLock": true}'
    ),

  // Save an array of coordinates: [[lat, lng], [lat, lng]]
  saveRoute: (coords: [number, number][]) => {
    localStorage.setItem(KEYS.ACTIVE_ROUTE, JSON.stringify(coords));
  },

  getRoute: (): [number, number][] => {
    const data = localStorage.getItem(KEYS.ACTIVE_ROUTE);
    return data ? JSON.parse(data) : [];
  },

  // Append a single new point to the existing route (Memory Efficient)
  appendPoint: (lat: number, lng: number) => {
    const route = JSON.parse(localStorage.getItem(KEYS.ACTIVE_ROUTE) || "[]");
    route.push([lat, lng]);
    localStorage.setItem(KEYS.ACTIVE_ROUTE, JSON.stringify(route));
  },

  clearRoute: () => localStorage.removeItem(KEYS.ACTIVE_ROUTE),
};
