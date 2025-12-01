import { createContext, useContext } from "react";

export const TerpeneContext = createContext({
  terpenes: [],
  aliasLookup: null,
  references: null,
  loadReferences: async () => [],
  rankIconMap: null,
});

export const useTerpeneContext = () => useContext(TerpeneContext);
