// 🎭 Movie Theater UI Components - shadcn/ui
// Central export file for all UI components

// Core UI Components
export { Button, buttonVariants, type ButtonProps } from './button'
export { Input, type InputProps } from './input'
export { Badge, badgeVariants, type BadgeProps } from './badge'

// Card Components (Standard + Movie-specific)
export {
    Card,
    CardHeader,
    CardFooter,
    CardTitle,
    CardDescription,
    CardContent,
    // Movie Theater specific variants
    MovieCard,
    CinemaCard
} from './card'

// Re-export common utilities
export { cn } from '@/lib/utils' 