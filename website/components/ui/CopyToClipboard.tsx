"use client";

import { useState } from "react";

export default function CopyToClipboard({ code }: { code: string }) {
    const [isCopied, setIsCopied] = useState(false);

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(code);
            console.log("Copied to clipboard");
            setIsCopied(true);
            setTimeout(() => {
                setIsCopied(false);
            }, 2000);
        } catch (error) {
            console.error("Error copying to clipboard", error);
        }
    };

    return (
        <button onClick={copyToClipboard}>
            {isCopied ? (
                `✅`
            ) : (
                `📋`
            )}
        </button>
    );
}
