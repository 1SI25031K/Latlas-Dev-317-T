import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ja", "en", "zh-CN", "zh-TW", "ko", "fr", "de"],
  defaultLocale: "ja",
  localePrefix: "always",
});
