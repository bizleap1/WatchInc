/**
 * Custom text splitter utility providing lightweight SplitText functionality
 * without requiring proprietary Club GreenSock dependencies.
 */
export function splitText(target, options = { type: "lines" }) {
    const el = typeof target === "string" ? document.querySelector(target) : target;
    if (!el) {
        return { chars: [], words: [], lines: [], revert: () => { } };
    }
    const originalContent = el.innerHTML;
    const rawText = el.textContent || "";
    const words = rawText.split(/\s+/).filter(Boolean);
    el.innerHTML = words
        .map((word) => `<span class="split-word inline-block overflow-hidden"><span class="split-char inline-block">${word}</span></span>`)
        .join(" ");
    const wordNodes = Array.from(el.querySelectorAll(".split-word"));
    const charNodes = Array.from(el.querySelectorAll(".split-char"));
    return {
        chars: charNodes,
        words: wordNodes,
        lines: wordNodes,
        revert: () => {
            el.innerHTML = originalContent;
        },
    };
}
