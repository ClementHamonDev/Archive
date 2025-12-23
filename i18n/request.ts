import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import { defaultLocale, locales, Locale } from "./config";

export default getRequestConfig(async () => {
  // Try to get locale from cookie first
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("locale")?.value as Locale | undefined;

  // Fall back to Accept-Language header
  let locale: Locale = defaultLocale;

  if (localeCookie && locales.includes(localeCookie)) {
    locale = localeCookie;
  } else {
    const headersList = await headers();
    const acceptLanguage = headersList.get("Accept-Language");
    if (acceptLanguage) {
      const preferredLocale = acceptLanguage
        .split(",")[0]
        .split("-")[0] as Locale;
      if (locales.includes(preferredLocale)) {
        locale = preferredLocale;
      }
    }
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
