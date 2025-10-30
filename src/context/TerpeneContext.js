import { createContext, useContext } from "react";

export const TerpeneContext = createContext({
  terpenes: [],
  aliasLookup: null,
});

export const useTerpeneContext = () => useContext(TerpeneContext);
