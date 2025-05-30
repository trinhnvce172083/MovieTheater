import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
        variants: {
            variant: {
                default:
                    "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
                secondary:
                    "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
                destructive:
                    "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
                outline: "text-foreground",
                // 🎬 Movie Theater Custom Variants
                rating: "border-transparent bg-yellow-500 text-black font-bold",
                genre: "border-transparent bg-cinema-100 text-cinema-800 dark:bg-cinema-800 dark:text-cinema-100",
                age: "border-red-500 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400",
                imax: "border-transparent bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold",
                vip: "border-transparent bg-gradient-to-r from-movie-gold to-yellow-500 text-black font-bold",
                "3d": "border-transparent bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    )
}

export { Badge, badgeVariants } 