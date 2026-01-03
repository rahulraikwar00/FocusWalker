import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useMemo,
  useEffect,
} from "react";

// ==================== TYPES ====================

export type ToastType = "info" | "success" | "warning" | "error";

export interface UserData {
  id: string;
  name: string;
  rank: string;
  unit: string;
  clearance: string;
  avatar: string;
  bio: string;
}

interface GlobalState {
  isDossierOpen: boolean;
  isSettingsOpen: boolean;
  searchQuery: string;
  toast: { show: boolean; msg: string; type: ToastType };
  isLocked: boolean;
  showWelcome: boolean;
  settings: {
    isDark: boolean;
    speedKmh: number;
    isWakeLockEnabled: boolean;
    isHapticsEnabled: boolean;
  };
  user: UserData;
}

interface GlobalContextValue extends GlobalState {
  setUI: (updates: Partial<GlobalState>) => void;
  updateSettings: (updates: Partial<GlobalState["settings"]>) => void;
  updateUser: (updates: Partial<UserData>) => void;
  triggerToast: (msg: string, type?: ToastType) => void;
  toggleTheme: () => void;
  completeOnboarding: () => void;
}

const GlobalContext = createContext<GlobalContextValue | undefined>(undefined);

// ==================== PROVIDER ====================

export function GlobalProvider({ children }: { children: ReactNode }) {
  // 1. Initialize State with LocalStorage fallbacks
  const [state, setState] = useState<GlobalState>(() => {
    // Check if running in browser
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

  // --- ACTIONS ---

  const setUI = useCallback((updates: Partial<GlobalState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateSettings = useCallback(
    (updates: Partial<GlobalState["settings"]>) => {
      setState((prev) => {
        const newSettings = { ...prev.settings, ...updates };
        localStorage.setItem("app_settings", JSON.stringify(newSettings));
        return { ...prev, settings: newSettings };
      });
    },
    []
  );

  const updateUser = useCallback((updates: Partial<UserData>) => {
    setState((prev) => {
      const newUser = { ...prev.user, ...updates };
      localStorage.setItem("user_dossier", JSON.stringify(newUser));
      return { ...prev, user: newUser };
    });
  }, []);

  const completeOnboarding = useCallback(() => {
    localStorage.setItem("onboarding_complete", "true");
    setUI({ showWelcome: false });
  }, [setUI]);

  const triggerToast = useCallback((msg: string, type: ToastType = "info") => {
    setState((prev) => ({ ...prev, toast: { show: true, msg, type } }));
    setTimeout(() => {
      setState((prev) => ({ ...prev, toast: { ...prev.toast, show: false } }));
    }, 3000);
  }, []);

  const toggleTheme = useCallback(() => {
    updateSettings({ isDark: !state.settings.isDark });
  }, [state.settings.isDark, updateSettings]);

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
    }),
    [
      state,
      setUI,
      updateSettings,
      updateUser,
      triggerToast,
      toggleTheme,
      completeOnboarding,
    ]
  );
  useEffect(() => {
    const root = window.document.documentElement;
    if (state.settings.isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [state.settings.isDark]);

  return (
    <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>
  );
}

// ==================== HELPERS ====================

const initialDefaultState: GlobalState = {
  isDossierOpen: false,
  isSettingsOpen: false,
  searchQuery: "",
  toast: { show: false, msg: "", type: "info" },
  isLocked: true,
  showWelcome: true,
  settings: {
    isDark: true,
    speedKmh: 5,
    isWakeLockEnabled: false,
    isHapticsEnabled: true,
  },
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
