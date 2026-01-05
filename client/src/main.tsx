import { createRoot } from "react-dom/client";
import { Suspense, lazy } from "react";
import "./styles/index.css";

// 1. Dynamic Import: This moves App (and its 500kb+ of Leaflet/Turf)
// out of the initial 'main.js' bundle.
const App = lazy(() => import("./App"));

// 2. A tiny loading component that matches your index.html shell
// This ensures there is no "white flash" when React takes over.
const BootLoader = () => <div className="bg-[#0a0a0a] h-screen w-full" />;

createRoot(document.getElementById("root")!).render(
  <Suspense fallback={<BootLoader />}>
    <App />
    {/* <div className=" flex h-screen w-screen items-center justify-center">
      GADHI HU ... sorry bhaiya maaf karna, abhi loading chal raha hai...
    </div> */}
  </Suspense>
);
