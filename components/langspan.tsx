import { FC } from "react"

const langEmoji: { [key:string]: string } = {
    en: '🇬🇧',
    cn: '🇨🇳'
}

function getLangEmoji(lang: string) {
    return langEmoji[lang] || lang
}

const LangSpan: FC<{ lang: string }> = ({ lang }) => {
    return <span>{getLangEmoji(lang)}</span>
}

export default LangSpan