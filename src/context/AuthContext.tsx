import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { authService, type AuthUser } from "../services/auth.service";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(
    authService.getStoredUser(),
  );
  const [loading, setLoading] = useState(authService.isAuthenticated());

  useEffect(() => {
    let active = true;

    if (!authService.isAuthenticated()) {
      return () => {
        active = false;
      };
    }

    authService
      .me()
      .then((currentUser) => {
        if (active) setUser(currentUser);
      })
      .catch(() => {
        if (active) {
          authService.logout();
          setUser(null);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const authenticatedUser = await authService.login(email, password);
    setUser(authenticatedUser);
    return authenticatedUser;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const currentUser = await authService.me();
    setUser(currentUser);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user && authService.isAuthenticated()),
      login,
      logout,
      refreshUser,
    }),
    [user, loading, login, logout, refreshUser],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}
