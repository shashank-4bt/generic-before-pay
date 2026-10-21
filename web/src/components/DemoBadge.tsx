"use client";

import { useI18n } from "@/lib/i18n/context";

export function DemoBadge() {
  const { t } = useI18n();
  const label = t("demo.badge");
  return (
    <span className="badge" lang={label.locale} data-provenance="fixture">
      {label.text}
    </span>
  );
}
