import {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";
import { UserConfig } from "./data/BalatroUtils";

const USER_CONFIG_KEY = "joker-forge-user-config";

interface UserConfigContextType {
  userConfig: UserConfig;
  setUserConfig: React.Dispatch<React.SetStateAction<UserConfig>>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const UserConfigContext = createContext<UserConfigContextType>({
  userConfig: { filters: {}, defaultAutoFormat: true, defaultGridSnap: false },
  setUserConfig: () => {},
});

type ContextProviderProps = {
  children: ReactNode;
};

export const UserConfigProvider = ({ children }: ContextProviderProps) => {
  const loadUserConfig = useCallback((): UserConfig => {
    try {
      const stored = localStorage.getItem(USER_CONFIG_KEY);
      return stored
        ? JSON.parse(stored)
        : {
            filters: {},
            defaultAutoFormat: true,
            defaultGridSnap: false,
          };
    } catch (err) {
      console.error("Failed to parse userConfig from localStorage", err);
      return {
        filters: {},
        defaultAutoFormat: true,
        defaultGridSnap: false,
      };
    }
  }, []);

  const [userConfig, setUserConfig] = useState<UserConfig>(() =>
    loadUserConfig()
  );

  useEffect(() => {
    localStorage.setItem(USER_CONFIG_KEY, JSON.stringify(userConfig));
  }, [userConfig]);

  return (
    <UserConfigContext.Provider value={{ userConfig, setUserConfig }}>
      {children}
    </UserConfigContext.Provider>
  );
};
