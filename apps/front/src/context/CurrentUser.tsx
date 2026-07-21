"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import type { User } from "@/lib/types";

interface CurrentUserContext {
  user: User | null;
  setUser: (u: User | null) => void;
}

const CurrentUserContext = createContext<CurrentUserContext>({
  user: null,
  setUser: () => {},
});

export function CurrentUserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("trophify_user");
    if (stored) {
      try {
        setUserState(JSON.parse(stored));
      } catch {
        /* ignore */
      }
    }
  }, []);

  function setUser(u: User | null) {
    setUserState(u);
    if (u) localStorage.setItem("trophify_user", JSON.stringify(u));
    else localStorage.removeItem("trophify_user");
  }

  return (
    <CurrentUserContext.Provider value={{ user, setUser }}>
      {children}
    </CurrentUserContext.Provider>
  );
}

export function useCurrentUser() {
  return useContext(CurrentUserContext);
}
