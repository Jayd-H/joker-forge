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

const generateBasicPageData = () => {
  const dataList: Array<{ objectType: string, filter: string, direction: string }> = []
  const gameObjectTypes = [
    "joker", "consumable", "enhancement",
    "seal", "edition", "voucher", "booster"
  ]

  let i = 0
  gameObjectTypes.forEach(type => {
    dataList.push({objectType: type, filter: "id", direction: "asc"})
    i += 1
  })

  return dataList
}

// eslint-disable-next-line react-refresh/only-export-components
export const UserConfigContext = createContext<UserConfigContextType>({
  userConfig: { pageData: generateBasicPageData(), defaultAutoFormat: true, defaultGridSnap: false },
  setUserConfig: () => {},
});

type ContextProviderProps = {
  children: ReactNode;
};

export const UserConfigProvider = ({ children }: ContextProviderProps) => {
  const loadUserConfig = useCallback((): UserConfig => {
    try {
      const stored = localStorage.getItem(USER_CONFIG_KEY);
      // @ts-ignore
      return stored && !stored.filters
        ? JSON.parse(stored)
        : {
            pageData: generateBasicPageData(),
            defaultAutoFormat: true,
            defaultGridSnap: false,
          };
    } catch (err) {
      console.error("Failed to parse userConfig from localStorage", err);
      return {
        pageData: generateBasicPageData(),
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
