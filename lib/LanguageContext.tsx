"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Lang } from "./i18n";

const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: "en", setLang: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    const stored = localStorage.getItem("aitutor_lang") as Lang;
    if (stored === "en" || stored === "af") setLang(stored);
  }, []);

  const changeLang = (l: Lang) => {
    setLang(l);
    localStorage.setItem("aitutor_lang", l);
  };

  return (
    <LangContext.Provider value={{ lang, setLang: changeLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LangContext);
}
