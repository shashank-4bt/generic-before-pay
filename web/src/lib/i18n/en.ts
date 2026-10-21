import { DISCLAIMER, OFFLINE_MESSAGE, RECOVERY_MESSAGE } from "@/lib/copy/approved";

export const en = {
  skip: "Skip to content",
  "lang.group": "Language",
  "lang.en": "English",
  "lang.hi": "हिन्दी",
  "action.scan": "Scan a prescription",
  "action.type": "Type medicine names",
  "action.startOver": "Start again",
  "action.retry": "Try again",
  "steps.label": "Steps",
  "steps.locked":
    "Later steps open after you start. If you refresh, the session is cleared for privacy.",
  "step.home": "Start",
  "step.scan": "Scan",
  "step.review": "Check names",
  "step.patient": "Person",
  "step.results": "Prices",
  "step.kendras": "Kendras",
  "step.print": "Print",
  "home.h1": "Listed prices, before you pay",
  "home.lede":
    "JanRx shows listed prices for medicines already named on a prescription. It does not give medical advice.",
  "home.step1.title": "Name the medicines",
  "home.step1.body": "Scan a prescription or type the names.",
  "home.step2.title": "Check every name",
  "home.step2.body": "Nothing is confirmed until you say so.",
  "home.step3.title": "Read listed prices",
  "home.step3.body":
    "A price appears only when it is in the dataset and you have confirmed the name.",
  "privacy.heading": "Privacy",
  "privacy.pending": "The privacy statement has not been approved yet.",
  "scan.h1": "Scan a prescription",
  "scan.lede":
    "The camera step is not built yet. You can type medicine names instead. Typing does not need a connection.",
  "shell.pending": "This step is not built yet.",
  "kendras.h1": "Jan Aushadhi Kendras",
  "kendras.lede": "Kendra locations are not in the dataset shipped with this repo.",
  disclaimer: DISCLAIMER,
  "recovery.body": RECOVERY_MESSAGE,
  "offline.body": OFFLINE_MESSAGE,
  "demo.badge": "Demo data",
  "error.title": "Something went wrong",
  "error.body": "You can try again, or start again. Nothing from this screen is kept.",
  "notFound.title": "Page not found",
  "notFound.body": "That page is not part of JanRx.",
  "loading.body": "Loading",
} as const;

export type MessageKey = keyof typeof en;
