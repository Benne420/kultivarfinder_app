import { createContext, useContext } from "react";

export const TerpeneContext = createContext({
  terpenes: [],
  aliasLookup: null,
  references: null,
  loadReferences: async () => [],
});

export const useTerpeneContext = () => useContext(TerpeneContext);
