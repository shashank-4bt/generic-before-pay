"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { DemoBadge } from "@/components/DemoBadge";
import { DisclaimerBlock } from "@/components/DisclaimerBlock";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { OfflineBanner } from "@/components/OfflineBanner";
import { StepIndicator } from "@/components/StepIndicator";
import { useI18n } from "@/lib/i18n/context";
import { useSession } from "@/lib/session/context";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useI18n();
  const { state, dispatch } = useSession();
  const skip = t("skip");
  const again = t("action.startOver");

  return (
    <>
      <a className="skip-link" href="#main">
        <span lang={skip.locale}>{skip.text}</span>
      </a>
      <OfflineBanner />
      <header className="site-header no-print">
        <div className="shell-wrap header-row">
          <Link className="wordmark" href="/">
            JanRx
          </Link>
          <div className="header-tools">
            <DemoBadge />
            {state.started ? (
              <button
                type="button"
                className="btn btn-secondary"
                lang={again.locale}
                onClick={() => {
                  dispatch({ type: "reset" });
                  router.push("/");
                }}
              >
                {again.text}
              </button>
            ) : null}
            <LanguageSwitch />
          </div>
        </div>
        <StepIndicator pathname={pathname} />
      </header>
      <main id="main" className="shell-wrap" tabIndex={-1}>
        {children}
      </main>
      <footer className="site-footer">
        <div className="shell-wrap">
          <DisclaimerBlock />
        </div>
      </footer>
    </>
  );
}
