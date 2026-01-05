import { createContext, useContext, useState } from "react";

const DrawerContext = createContext({ isOpen: false, toggle: () => {} });

export const DrawerProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);

  return (
    <DrawerContext.Provider value={{ isOpen, toggle }}>
      {children}
    </DrawerContext.Provider>
  );
};

export const useDrawer = () => useContext(DrawerContext);
