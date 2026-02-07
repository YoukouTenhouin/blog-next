import { FC } from 'react'
import Image from 'next/image'
import clsx from 'clsx'

import { languageToCountryCode, LangsAvailable } from '@lib/languages'

import styles from './lang_button.module.css'


const LangButton: FC<{ lang: LangsAvailable, onClick?: () => void, active?: boolean }> = (
    { lang, onClick, active }
) => {
    return (
        <div
            className={clsx({
                [styles.lang_button_active]: active,
                [styles.lang_button]: true,
            })}
            onClick={onClick}
        >
            <Image
                src={`/flags_pixel/${languageToCountryCode(lang)}.png`}
                width={15}
                height={10}
                alt={`Language: ${lang}`} />
        </div>
    );
};

export default LangButton
