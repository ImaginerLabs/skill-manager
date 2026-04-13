// ============================================================
// src/i18n/types.ts — i18n TypeScript 类型声明
// ============================================================
import "i18next";
import { zh } from "./locales/zh";

export type TranslationKeys = typeof zh;

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "translation";
    resources: {
      translation: TranslationKeys;
    };
  }
}
