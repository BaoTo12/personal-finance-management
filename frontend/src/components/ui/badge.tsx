import { cn } from "@/lib/utils";
import { type HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: "default" | "success" | "warning" | "error" | "info" | "outline";
    size?: "sm" | "md";
}

export function Badge({
    className,
    variant = "default",
    size = "md",
    children,
    ...props
}: BadgeProps) {
    const variants = {
        default: "bg-[var(--bg-input)] text-[var(--text-secondary)]",
        success: "bg-[var(--success)]/20 text-[var(--success)]",
        warning: "bg-[var(--warning)]/20 text-[var(--warning)]",
        error: "bg-[var(--error)]/20 text-[var(--error)]",
        info: "bg-[var(--info)]/20 text-[var(--info)]",
        outline: "bg-transparent border border-[var(--border-color)] text-[var(--text-secondary)]",
    };

    const sizes = {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-1 text-xs",
    };

    return (
        <span
            className={cn(
                "inline-flex items-center font-medium rounded-full",
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {children}
        </span>
    );
}
