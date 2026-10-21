import type { MessageKey } from "@/lib/i18n/en";
import { TODO_NEEDS_HUMAN_REVIEW } from "@/lib/i18n/placeholder";

/**
 * Chrome strings are short interface labels.
 * Legal, privacy, and disclaimer Hindi is TODO_NEEDS_HUMAN_REVIEW — do not machine-translate those.
 */
export const hi: Record<MessageKey, string> = {
  skip: "सामग्री पर जाएँ",
  "lang.group": "भाषा",
  "lang.en": "English",
  "lang.hi": "हिन्दी",
  "action.scan": "नुस्खा स्कैन करें",
  "action.type": "दवा के नाम लिखें",
  "action.startOver": "फिर से शुरू करें",
  "action.retry": "फिर कोशिश करें",
  "steps.label": "चरण",
  "steps.locked":
    "बाद के चरण शुरू करने के बाद खुलते हैं। पेज रीफ़्रेश करने पर सत्र गोपनीयता के लिए मिट जाता है।",
  "step.home": "शुरू",
  "step.scan": "स्कैन",
  "step.review": "नाम जाँचें",
  "step.patient": "व्यक्ति",
  "step.results": "कीमत",
  "step.kendras": "केंद्र",
  "step.print": "प्रिंट",
  "home.h1": "भुगतान से पहले, सूचीबद्ध कीमत",
  "home.lede":
    "JanRx उन दवाओं की सूचीबद्ध कीमत दिखाता है जिनका नाम पर्ची पर पहले से है। यह चिकित्सकीय सलाह नहीं देता।",
  "home.step1.title": "दवाओं के नाम",
  "home.step1.body": "नुस्खा स्कैन करें, या नाम लिखें।",
  "home.step2.title": "हर नाम जाँचें",
  "home.step2.body": "जब तक आप पक्का न करें, कुछ पक्का नहीं माना जाता।",
  "home.step3.title": "सूचीबद्ध कीमत पढ़ें",
  "home.step3.body": "कीमत तभी दिखती है जब वह डेटा में हो और आपने नाम पक्का किया हो।",
  "privacy.heading": "गोपनीयता",
  "privacy.pending": "गोपनीयता का कथन अभी मंज़ूर नहीं हुआ है।",
  "scan.h1": "नुस्खा स्कैन करें",
  "scan.lede":
    "कैमरा वाला चरण अभी तैयार नहीं है। आप दवा के नाम लिख सकते हैं। लिखने के लिए इंटरनेट ज़रूरी नहीं।",
  "shell.pending": "यह चरण अभी तैयार नहीं है।",
  "kendras.h1": "जन औषधि केंद्र",
  "kendras.lede": "इस रिपो के डेटा में केंद्रों की सूची नहीं है।",
  disclaimer: TODO_NEEDS_HUMAN_REVIEW,
  "recovery.body": TODO_NEEDS_HUMAN_REVIEW,
  "offline.body": TODO_NEEDS_HUMAN_REVIEW,
  "info.missing": TODO_NEEDS_HUMAN_REVIEW,
  "data.unavailable": "दवाओं की सूची लोड नहीं हो सकी।",
  "demo.badge": "डेमो डेटा",
  "error.title": "कुछ गड़बड़ हो गई",
  "error.body": "आप फिर कोशिश कर सकते हैं, या शुरू से शुरू कर सकते हैं। इस स्क्रीन की जानकारी रखी नहीं जाती।",
  "notFound.title": "पेज नहीं मिला",
  "notFound.body": "यह पेज JanRx का हिस्सा नहीं है।",
  "loading.body": "लोड हो रहा है",
};
