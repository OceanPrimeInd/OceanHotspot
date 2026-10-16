import { useState, useEffect, useCallback, createContext, useContext } from "react";

const RouterContext = createContext(null);
const BASE = "/regulations";

function readPath() {
  const current = window.location.pathname.replace(/\/$/, "") || "/";
  if (current === BASE) return "/";
  if (current.startsWith(`${BASE}/`)) return current.slice(BASE.length);
  return "/";
}

export function RouterProvider({ children }) {
  const [path, setPath] = useState("/");

  useEffect(() => {
    const sync = () => setPath(readPath());
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  const navigate = useCallback((to) => {
    const next = `${BASE}${to === "/" ? "" : to}`;
    if (next !== window.location.pathname) {
      window.history.pushState({}, "", next);
    }
    setPath(to);
    window.scrollTo(0, 0);
  }, []);

  return (
    <RouterContext.Provider value={{ path, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRoute() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error("useRoute must be used within a RouterProvider");
  return ctx;
}

export function Link({ to, className, children, onClick }) {
  const { navigate } = useRoute();
  return (
    <a
      href={`${BASE}${to === "/" ? "" : to}`}
      className={className}
      onClick={(e) => {
        e.preventDefault();
        onClick?.();
        navigate(to);
      }}
    >
      {children}
    </a>
  );
}
