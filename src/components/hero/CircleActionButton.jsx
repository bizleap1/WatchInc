"use client";
import React from "react";
export default function CircleActionButton({ size = 48, ariaLabel, onClick, children, variant = "light", className = "", cursorMode = "LINK", }) {
    const isLight = variant === "light";
    return (<button type="button" aria-label={ariaLabel} onClick={onClick} data-cursor={cursorMode} style={{ width: size, height: size }} className={`group/circle relative inline-flex items-center justify-center rounded-full border overflow-hidden cursor-pointer shrink-0 transition-colors duration-300 ${isLight
            ? "border-[#F3EFE7]/75 text-[#F3EFE7]"
            : "border-[#0A0A0B]/80 text-[#0A0A0B] bg-transparent"} ${className}`}>
      {/* Expanding fill from centre */}
      <span aria-hidden="true" className={`absolute inset-0 rounded-full scale-0 group-hover/circle:scale-100 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] origin-center ${isLight ? "bg-[#F3EFE7]" : "bg-[#0A0A0B]"}`}/>
      {/* Icon switches color cleanly on hover */}
      <span className={`relative z-10 flex items-center justify-center transition-colors duration-300 ${isLight ? "group-hover/circle:text-[#0A0A0B]" : "group-hover/circle:text-[#F3EFE7]"}`}>
        {children}
      </span>
    </button>);
}
