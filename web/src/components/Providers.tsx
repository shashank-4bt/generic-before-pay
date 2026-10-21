"use client";

import { I18nProvider } from "@/lib/i18n/context";
import { SessionProvider } from "@/lib/session/context";
import type { SessionState } from "@/lib/session/reducer";

export function Providers({
  children,
  initialSession,
}: {
  children: React.ReactNode;
  initialSession?: SessionState;
}) {
  return (
    <I18nProvider>
      <SessionProvider initial={initialSession}>{children}</SessionProvider>
    </I18nProvider>
  );
}
