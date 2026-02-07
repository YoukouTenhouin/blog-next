import { LangsAvailable } from './languages'

export type Translations = Partial<Record<LangsAvailable, string>>

export default function translated(currentLang: LangsAvailable, trans: Translations) {
    if (currentLang in trans) {
        return trans[currentLang]
    } else if ("en" in trans) {
        return trans.en
    } else {
        return "!!! MISSING TRANSLATION !!!"
    }
}
