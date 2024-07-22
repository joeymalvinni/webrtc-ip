import React, { useState, useEffect } from 'react';
import { codeToHtml } from 'shiki';
import { transformerNotationHighlight, transformerNotationDiff } from '@shikijs/transformers';
import type { BundledLanguage, BundledTheme } from 'shiki';
import CopyToClipboard from './CopyToClipboard';

type Props = {
    code: string;
    lang?: BundledLanguage;
    theme?: BundledTheme;
};

const Code: React.FC<Props> = ({ code, lang = 'javascript', theme = 'nord' }) => {
    const [html, setHtml] = useState<string>(`<code>${code}</code>`);
    const [isHovering, setIsHovered] = useState(false);
    const onMouseEnter = () => setIsHovered(true);
    const onMouseLeave = () => setIsHovered(false);

    useEffect(() => {
        const generateHtml = async () => {
            const result = await codeToHtml(code, {
                lang,
                theme,
                transformers: [transformerNotationHighlight(), transformerNotationDiff()],
            });
            setHtml(result);
        };
        generateHtml();
    }, [code, lang, theme]);

    return (
        <div
            className="relative rounded-lg max-w-xl"
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <div
                className="code-container border-neutral-700 text-sm [&>pre]:py-8 [&>pre]:px-6 [&>pre]:rounded-lg [&>pre]:!bg-[#141417] [&>pre]:border-[#1F2025] [&>pre]:border-2"
                dangerouslySetInnerHTML={{ __html: html }}
            ></div>
            <div className={`copy-icon absolute top-2 right-2 ${isHovering ? "opacity-100" : "opacity-0"} transition-opacity duration-300 bg-[#1A1B1F] border-[#1F2025] border px-2 py-1 rounded-md flex justify-center`}>
                <CopyToClipboard code={code} />
            </div>
        </div >
    );
};

export default Code;
