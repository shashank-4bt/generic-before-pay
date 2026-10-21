"use client";

import { useRouter } from "next/navigation";
import { PrivacySlot } from "@/components/PrivacySlot";
import { useI18n } from "@/lib/i18n/context";
import { useSession } from "@/lib/session/context";

export function ScanView() {
  const { t } = useI18n();
  const { dispatch } = useSession();
  const router = useRouter();
  const h1 = t("scan.h1");
  const lede = t("scan.lede");
  const type = t("action.type");

  return (
    <div className="stack">
      <h1 lang={h1.locale}>{h1.text}</h1>
      <p className="lede" lang={lede.locale}>
        {lede.text}
      </p>
      <div className="actions">
        <button
          type="button"
          className="btn btn-primary"
          lang={type.locale}
          onClick={() => {
            dispatch({ type: "start" });
            router.push("/review");
          }}
        >
          {type.text}
        </button>
      </div>
      <PrivacySlot />
    </div>
  );
}
