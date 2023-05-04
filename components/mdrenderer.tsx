import clsx from "clsx";
import { FC, ReactNode } from "react";
import { useRemarkSync } from "react-remark";
import Window from "./window";
import styles from "./mdrenderer.module.css";
import hljs from "highlight.js";

function remarkCodeHandler(_, node: any) {
  const value = node.value ? node.value + "\n" : "";
  const lang = node.lang ? node.lang.match(/^[^ \t]+(?=[ \t]|$)/) : null;

  const properties: any = { value: value};

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

const CodeBlock: FC<{ lang?: string, value: string }>= ({ lang, value }) => {
    let html = lang ? hljs.highlight(lang, value).value : value
    return (
        <Window title="TERM">
            <span className={styles.term_line}>{"> show ./code" + (lang ? `.${lang}` : "")}</span>
            <pre className={styles.codeblock}><code dangerouslySetInnerHTML={{ __html: html }} /></pre>
        </Window>
    )
}

const MDRenderer: FC<{ content: string }> = ({ content }) => {
  return useRemarkSync(content, {
    remarkToRehypeOptions: {
      handlers: {
        code: remarkCodeHandler,
      },
    },
    rehypeReactOptions: {
        components: {
            mdblockcode: CodeBlock
        }
    }
  });
};

export default MDRenderer;
