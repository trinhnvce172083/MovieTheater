# 🎭 Movie Theater - shadcn/ui Setup

Hệ thống UI components được customize cho Movie Theater Management System.

## 🚀 Đã cài đặt

### ✅ Core Dependencies
```bash
npm install class-variance-authority clsx tailwind-merge lucide-react @radix-ui/react-slot @radix-ui/react-icons tailwindcss-animate
```

### ✅ Components đã tạo
- 🔘 **Button** - Với cinema & gold variants
- 🃏 **Card** - Với MovieCard & CinemaCard specialized
- 🏷️ **Badge** - Movie ratings, genres, age restrictions
- 📝 **Input** - Form inputs với shadcn styling
- 📦 **Index** - Export tất cả components

### ✅ Configuration Files
- `components.json` - shadcn/ui config
- `tailwind.config.ts` - TailwindCSS với shadcn colors
- `src/lib/utils.ts` - cn() utility function
- `src/app/globals.css` - CSS variables & movie-specific styles

## 🎨 Custom Movie Theater Styling

### 🎬 Colors
```css
cinema: {
  50: '#f0f3ff',   // Light backgrounds
  100: '#e0e8ff',  // Hover states
  500: '#6366f1',  // Primary cinema color
  600: '#4f46e5',  // Button backgrounds
  700: '#4338ca',  // Hover states
  800: '#3730a3',  // Dark mode
  900: '#312e81',  // Footer, accents
}

movie: {
  gold: '#ffd700',    // VIP, premium features
  silver: '#c0c0c0',  // Standard features
  bronze: '#cd7f32',  // Basic features
}
```

### 🎭 Button Variants
- `cinema` - Primary theater branding
- `gold` - Premium/VIP features
- Standard shadcn variants (default, outline, etc.)

### 🎪 Badge Variants
- `rating` - Movie ratings (9.5, 8.8, etc.)
- `genre` - Movie genres (Action, Drama, etc.)
- `age` - Age restrictions (T13, T16, etc.)
- `imax` - IMAX format
- `vip` - VIP screenings
- `3d` - 3D format

### 🏗️ Card Components
- `Card` - Standard shadcn card
- `MovieCard` - Specialized for movie displays
- `CinemaCard` - Theater information cards

## 🧪 Usage Examples

### Basic Button
```tsx
import { Button } from "@/components/ui/button"

<Button variant="cinema">Đặt vé</Button>
<Button variant="gold">VIP Booking</Button>
```

### Movie Card
```tsx
import { MovieCard, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

<MovieCard>
  <div className="aspect-[2/3] bg-gradient-to-br from-purple-500 to-pink-500">
    <Badge variant="rating">9.5</Badge>
    <Badge variant="imax">IMAX</Badge>
  </div>
  <CardHeader>
    <CardTitle>Avatar: The Way of Water</CardTitle>
  </CardHeader>
</MovieCard>
```

### Badges
```tsx
import { Badge } from "@/components/ui/badge"

<Badge variant="rating">9.5</Badge>
<Badge variant="genre">Khoa học viễn tưởng</Badge>
<Badge variant="age">T13</Badge>
<Badge variant="imax">IMAX</Badge>
<Badge variant="vip">VIP</Badge>
<Badge variant="3d">3D</Badge>
```

## 🎯 Custom CSS Classes

### 🎬 Utility Classes
```css
.movie-gradient        /* Purple-pink-blue gradient */
.cinema-card          /* Glass effect card */
.glass-effect         /* Backdrop blur effect */
```

### 🎭 Animations
```css
.animate-movie-fade    /* Fade in from bottom */
.animate-cinema-glow   /* Pulsing glow effect */
```

## 🔄 Adding More Components

### 1. Cài đặt component mới
```bash
npx shadcn@latest add [component-name]
```

### 2. Customize cho Movie Theater
- Thêm movie-specific variants
- Cập nhật colors/styling
- Export trong `src/components/ui/index.ts`

### 3. Components nên cài thêm
```bash
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add calendar
npx shadcn@latest add form
npx shadcn@latest add table
npx shadcn@latest add tabs
npx shadcn@latest add avatar
npx shadcn@latest add progress
```

## 🎨 Theming

### Light/Dark Mode
TailwindCSS config đã setup dark mode với `darkMode: "class"`.

Sử dụng:
```tsx
<html className="dark">  <!-- Dark mode -->
<html>                   <!-- Light mode -->
```

### Responsive Design
Tất cả components responsive với TailwindCSS:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```

## 🏆 Best Practices

1. **Consistent Naming**: Dùng movie/cinema terminology
2. **Responsive First**: Mobile-first design
3. **Accessibility**: ARIA labels, keyboard navigation
4. **Performance**: Tree-shaking, lazy loading
5. **Type Safety**: TypeScript cho tất cả components

## 🔗 Useful Links

- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [Radix UI Primitives](https://www.radix-ui.com/docs/primitives)
- [Lucide Icons](https://lucide.dev/)

---

**🎬 Perfect! shadcn/ui đã được setup hoàn chỉnh cho Movie Theater System!**