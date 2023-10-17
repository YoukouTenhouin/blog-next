import { FC, useState } from "react";
import { useRemarkSync } from "react-remark";
import Window from "./window";
import styles from "./mdrenderer.module.css";
import hljs from "highlight.js";
import { Inconsolata } from "next/font/google";

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
};

const MDRenderer: FC<{ content: string }> = ({ content }) => {
    return useRemarkSync(content, {
        remarkToRehypeOptions: {
            handlers: {
                code: remarkCodeHandler,
            },
        },
        rehypeReactOptions: {
            components: {
                mdblockcode: CodeBlock,
            },
        },
    });
};

export default MDRenderer;
