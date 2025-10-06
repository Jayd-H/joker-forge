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

const gameObjectTypes = [
    "joker", "consumable", "enhancement",
    "seal", "edition", "voucher", "booster",
    "vanilla_joker"
  ]

const generatePageData = (stored: string | null ) => {
  const dataList: Array<{ objectType: string, filter: string, direction: string }> = []
  let itemTypes: Array <string> = []
  if (stored) {
    const userConfig: UserConfig = JSON.parse(stored)
    itemTypes = userConfig.pageData.map(item => item.objectType)
  }

  let i = 0
  gameObjectTypes.forEach(type => {
    if (!itemTypes.includes(type)) {
      dataList.push({objectType: type, filter: "id", direction: "asc"})
    }
    i += 1
  })

  return dataList
}

// eslint-disable-next-line react-refresh/only-export-components
export const UserConfigContext = createContext<UserConfigContextType>({
  userConfig: { pageData: generatePageData(null), defaultAutoFormat: true, defaultGridSnap: false },
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
      return (stored && !stored.filters && stored.length === gameObjectTypes.length)
        ? JSON.parse(stored)
        : {
            pageData: generatePageData(stored),
            defaultAutoFormat: true,
            defaultGridSnap: false,
          }
    } catch (err) {
      console.error("Failed to parse userConfig from localStorage", err);
      return {
        pageData: generatePageData(null),
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
