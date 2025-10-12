import {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";
import { PageData, UserConfig } from "./data/BalatroUtils";

const USER_CONFIG_KEY = "joker-forge-user-config";

interface UserConfigContextType {
  userConfig: UserConfig;
  setUserConfig: React.Dispatch<React.SetStateAction<UserConfig>>;
}

const gameObjectTypes = [
    "joker", "consumable", "enhancement",
    "seal", "edition", "voucher", "deck", "booster",
    "vanilla_joker", "vanilla_consumable", "vanilla_booster",
    "vanilla_enhancement", "vanilla_seal", "vanilla_voucher",
    "vanilla_deck" 
  ]

const generatePageData = (stored: string | null ) => {
  const dataList: PageData[] = []
  let itemTypes: string[] = []
  let userConfig: UserConfig

  if (stored) {
    userConfig = JSON.parse(stored)
    itemTypes = userConfig.pageData.map(item => item.objectType)
  }

  let i = 0
  gameObjectTypes.forEach(type => {
    if (!itemTypes.includes(type)) {
      dataList.push({objectType: type, filter: 'id', direction: 'asc', editList: []})
    } else {
      dataList.push(userConfig.pageData[i])
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
      return (stored)
        ? { 
          pageData: generatePageData(stored),
          defaultAutoFormat: true,
          defaultGridSnap: false,
        }
        : {
            pageData: generatePageData(null),
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
