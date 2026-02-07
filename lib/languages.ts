// Language to Country code map

export type LangsAvailable = "en" | "zh";

const MAP = {
    "zh": "cn",
    "en": "uk",
}

export function languageToCountryCode(language: LangsAvailable | string) {
    if (language in MAP) {
        return MAP[language]
    }

    return "unknown"
}
