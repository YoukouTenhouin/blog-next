export interface Translations {
    [key: string]: string
    en: string
    cn?: string
}

export default function translated(currentLang: string, trans: Translations) {
    return trans[currentLang] || trans.en
}