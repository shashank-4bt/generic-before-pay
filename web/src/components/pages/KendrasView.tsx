"use client";

import { useI18n } from "@/lib/i18n/context";

export function KendrasView() {
  const { t } = useI18n();
  const h1 = t("kendras.h1");
  const lede = t("kendras.lede");
  return (
    <div className="stack">
      <h1 lang={h1.locale}>{h1.text}</h1>
      <p lang={lede.locale}>{lede.text}</p>
    </div>
  );
}
