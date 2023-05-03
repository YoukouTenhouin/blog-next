import Link from "next/link";
import { FC } from "react";
import LangSpan from "./langspan";

const LangButton: FC<{ lang: string, href: string, inactive?: boolean }> = ({ lang, href, inactive }) => {
    const children = <LangSpan lang={lang} />
    return inactive ? children : <Link href={href}>{children}</Link>
}

export default LangButton