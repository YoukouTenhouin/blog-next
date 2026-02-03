import { FC, PropsWithChildren, useState } from "react";
import * as prod from 'react/jsx-runtime';
import Window from "./window";
import styles from "./mdrenderer.module.css";
import hljs from "highlight.js";
import { Inconsolata } from "next/font/google";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkToRehype from 'remark-rehype';
import rehypeReact from 'rehype-react';

const codeFont = Inconsolata({ subsets: ["latin"] });

function remarkCodeHandler(_, node: any) {
    const value = node.value ? node.value + "\n" : "";
    const lang = node.lang ? node.lang.match(/^[^ \t]+(?=[ \t]|$)/) : null;

    const properties: any = { value: value };

    if (lang) {
        properties.lang = lang;
    }

    // Create `<mdblockcode>`
    // We are not actually rendering this element; this is just a placeholder which will be transfered into a React component later
    let result: any = {
        type: "element",
        tagName: "mdblockcode",
        properties,
        children: [],
    };

    if (node.meta) result.data = { meta: node.meta };

    return result;
}

const CodeBlock: FC<{ lang?: string; value: string }> = ({ lang, value }) => {
    let html = lang ? hljs.highlight(lang, value).value : value;
    const [folded, setFolded] = useState(false)

    return (
        <Window>
            <Window.TitleBar>
                <Window.TitleButtonGroup>
                    <Window.TitleButton onClick={() => setFolded(!folded)}>➖</Window.TitleButton>
                </Window.TitleButtonGroup>
                <Window.TitleText>CODE VIEWER</Window.TitleText>
            </Window.TitleBar>
            <Window.Body folded={folded}>
                <pre className={styles.codeblock}>
                    <code
                        className={codeFont.className}
                        dangerouslySetInnerHTML={{ __html: html }}
                    />
                </pre>
            </Window.Body>
        </Window>
    );
}

const BlockQuote: FC<PropsWithChildren> = ({ children }) => {
    return (
        <Window>
            <Window.TitleBar>
                <Window.TitleText>QUOTE</Window.TitleText>
            </Window.TitleBar>
            <Window.Body>
                <div className={styles.blockquote}>
                    {children}
                </div>
            </Window.Body>
        </Window>
    );
}

const production = { Fragment: prod.Fragment, jsx: prod.jsx, jsxs: prod.jsxs }

const MDRenderer: FC<{ content: string }> = ({ content }) => {
    return unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkToRehype, {
            handlers: {
                code: remarkCodeHandler,
            }
        })
        .use(rehypeReact, {
            ...production,
            components: {
                blockquote: BlockQuote,
                mdblockcode: CodeBlock,
            }
        } as any)
        .processSync(content).result
};

export default MDRenderer;
