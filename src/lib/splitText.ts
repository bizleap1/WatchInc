/**
 * Custom text splitter utility providing lightweight SplitText functionality
 * without requiring proprietary Club GreenSock dependencies.
 */

export interface SplitResult {
  chars: HTMLElement[];
  words: HTMLElement[];
  lines: HTMLElement[];
  revert: () => void;
}

export function splitText(
  target: HTMLElement | string,
  options: { type?: "chars" | "words" | "lines" } = { type: "lines" }
): SplitResult {
  const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
  if (!el) {
    return { chars: [], words: [], lines: [], revert: () => {} };
  }

  const originalContent = el.innerHTML;
  const rawText = el.textContent || "";
  const words = rawText.split(/\s+/).filter(Boolean);

  el.innerHTML = words
    .map(
      (word) =>
        `<span class="split-word inline-block overflow-hidden"><span class="split-char inline-block">${word}</span></span>`
    )
    .join(" ");

  const wordNodes = Array.from(el.querySelectorAll<HTMLElement>(".split-word"));
  const charNodes = Array.from(el.querySelectorAll<HTMLElement>(".split-char"));

  return {
    chars: charNodes,
    words: wordNodes,
    lines: wordNodes,
    revert: () => {
      el.innerHTML = originalContent;
    },
  };
}
