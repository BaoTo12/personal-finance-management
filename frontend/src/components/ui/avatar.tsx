import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/utils";
import Image from "next/image";

interface AvatarProps {
    src?: string;
    alt?: string;
    name?: string;
    size?: "sm" | "md" | "lg" | "xl";
    className?: string;
}

export function Avatar({ src, alt, name, size = "md", className }: AvatarProps) {
    const sizes = {
        sm: "w-8 h-8 text-xs",
        md: "w-10 h-10 text-sm",
        lg: "w-12 h-12 text-base",
        xl: "w-16 h-16 text-lg",
    };

    const imageSizes = {
        sm: 32,
        md: 40,
        lg: 48,
        xl: 64,
    };

    if (src) {
        return (
            <div
                className={cn(
                    "relative rounded-full overflow-hidden bg-[var(--bg-input)]",
                    sizes[size],
                    className
                )}
            >
                <Image
                    src={src}
                    alt={alt || name || "Avatar"}
                    width={imageSizes[size]}
                    height={imageSizes[size]}
                    className="object-cover w-full h-full"
                />
            </div>
        );
    }

    return (
        <div
            className={cn(
                "flex items-center justify-center rounded-full bg-[var(--primary)] text-white font-medium",
                sizes[size],
                className
            )}
        >
            {name ? getInitials(name) : "?"}
        </div>
    );
}
