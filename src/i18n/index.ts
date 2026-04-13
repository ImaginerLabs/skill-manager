// ============================================================
// src/i18n/index.ts — i18next 国际化初始化
// ============================================================
import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import { en } from "./locales/en";
import { zh } from "./locales/zh";

i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      zh: { translation: zh },
      en: { translation: en },
    },
    supportedLngs: ["zh", "en"],
    fallbackLng: "zh",
    interpolation: {
      escapeValue: false, // React 已处理 XSS
    },
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "skill-manager-lang",
      caches: ["localStorage"],
    },
  });

export default i18next;
