"use client";

import React from "react";

interface CircleActionButtonProps {
  size?: number;
  ariaLabel: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
  variant?: "light" | "dark";
  className?: string;
  cursorMode?: string;
}

export default function CircleActionButton({
  size = 48,
  ariaLabel,
  onClick,
  children,
  variant = "light",
  className = "",
  cursorMode = "LINK",
}: CircleActionButtonProps) {
  const isLight = variant === "light";

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      data-cursor={cursorMode}
      style={{ width: size, height: size }}
      className={`group/circle relative inline-flex items-center justify-center rounded-full border overflow-hidden cursor-pointer shrink-0 transition-colors duration-300 ${
        isLight
          ? "border-white/90 text-white"
          : "border-black/80 text-black bg-transparent"
      } ${className}`}
    >
      {/* Expanding fill from centre */}
      <span
        aria-hidden="true"
        className={`absolute inset-0 rounded-full scale-0 group-hover/circle:scale-100 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] origin-center ${
          isLight ? "bg-white" : "bg-black"
        }`}
      />
      {/* Icon switches color cleanly on hover */}
      <span
        className={`relative z-10 flex items-center justify-center transition-colors duration-300 ${
          isLight ? "group-hover/circle:text-black" : "group-hover/circle:text-white"
        }`}
      >
        {children}
      </span>
    </button>
  );
}
