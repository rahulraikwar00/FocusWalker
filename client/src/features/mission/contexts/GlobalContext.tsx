import {
  GlobalContextValue,
  GlobalState,
  ToastType,
  UserData,
} from "@/types/types";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from "react";

// ==================== TYPES ====================

const GlobalContext = createContext<GlobalContextValue | undefined>(undefined);

// ==================== PROVIDER ====================

export function GlobalProvider({ children }: { children: ReactNode }) {
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Initialize State with LocalStorage fallbacks
  const [state, setState] = useState<GlobalState>(() => {
    if (typeof window === "undefined") return initialDefaultState;

    const savedUser = localStorage.getItem("user_dossier");
    const savedSettings = localStorage.getItem("app_settings");
    const onboardingDone = localStorage.getItem("onboarding_complete");

    return {
      ...initialDefaultState,
      user: savedUser ? JSON.parse(savedUser) : initialDefaultState.user,
      settings: savedSettings
        ? JSON.parse(savedSettings)
        : initialDefaultState.settings,
      showWelcome: onboardingDone !== "true",
    };
  });

  // --- PERSISTENCE LAYER ---
  // Background sync to LocalStorage whenever settings or user data change
  useEffect(() => {
    localStorage.setItem("app_settings", JSON.stringify(state.settings));
  }, [state.settings]);

  useEffect(() => {
    localStorage.setItem("user_dossier", JSON.stringify(state.user));
  }, [state.user]);

  // --- ACTIONS ---

  const setUI = useCallback((updates: Partial<GlobalState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateSettings = useCallback(
    (updates: Partial<GlobalState["settings"]>) => {
      setState((prev) => ({
        ...prev,
        settings: { ...prev.settings, ...updates },
      }));
    },
    []
  );

  const updateUser = useCallback((updates: Partial<UserData>) => {
    setState((prev) => ({
      ...prev,
      user: { ...prev.user, ...updates },
    }));
  }, []);

  const completeOnboarding = useCallback(() => {
    localStorage.setItem("onboarding_complete", "true");
    setState((prev) => ({ ...prev, showWelcome: false }));
  }, []);

  const triggerToast = useCallback((msg: string, type: ToastType = "info") => {
    // Clear existing timer so toasts don't cut each other off
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);

    setState((prev) => ({ ...prev, toast: { show: true, msg, type } }));

    toastTimerRef.current = setTimeout(() => {
      setState((prev) => ({ ...prev, toast: { ...prev.toast, show: false } }));
    }, 3000);
  }, []);

  const toggleTheme = useCallback(() => {
    updateSettings({ isDark: !state.settings.isDark });
  }, [state.settings.isDark, updateSettings]);

  const setMissionStatus = useCallback(
    (status: GlobalState["missionStatus"]) => {
      setState((prev) => ({ ...prev, missionStatus: status }));
    },
    []
  );

  // --- THEME SYNC ---
  useEffect(() => {
    const root = window.document.documentElement;
    if (state.settings.isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [state.settings.isDark]);

  // --- MEMOIZED VALUE ---
  const value = useMemo(
    () => ({
      ...state,
      setUI,
      updateSettings,
      updateUser,
      triggerToast,
      toggleTheme,
      completeOnboarding,
      setMissionStatus,
    }),
    [
      state,
      setUI,
      updateSettings,
      updateUser,
      triggerToast,
      toggleTheme,
      completeOnboarding,
      setMissionStatus,
    ]
  );

  return (
    <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>
  );
}

// ==================== HELPERS ====================

const initialDefaultState: GlobalState = {
  isDossierOpen: false,
  isSettingsOpen: false,
  isSideSheetOpen: false,
  searchQuery: "",
  toast: { show: false, msg: "", type: "info" },
  isLocked: true,
  showWelcome: true,
  settings: {
    isDark: true,
    speedKmh: 5,
    isWakeLockEnabled: false,
    isHapticsEnabled: true,
    breakDuration: 25,
  },
  missionStatus: "idle",
  user: {
    id: "UX-8829",
    name: "FOCUS WALKER",
    rank: "Scout",
    unit: "ALPHA-6",
    clearance: "Level 1",
    avatar: "",
    bio: "Field operative specialized in focused navigation.",
  },
};

export const useGlobal = () => {
  const context = useContext(GlobalContext);
  if (!context) throw new Error("useGlobal must be used within GlobalProvider");
  return context;
};
