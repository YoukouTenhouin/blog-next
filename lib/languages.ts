// Language to Country code map

export type LangsAvailable = "en" | "zh" | "jp";

const MAP = {
    "zh": "cn",
    "en": "uk",
    "jp": "jp",
}

export function languageToCountryCode(language: LangsAvailable | string) {
    if (language in MAP) {
        return MAP[language]
    }

    return "unknown"
}
