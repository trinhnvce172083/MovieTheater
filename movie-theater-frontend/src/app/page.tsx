import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, MovieCard, CinemaCard } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Film, Star, Clock, MapPin, Calendar } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-cinema-50/20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-cinema-600 via-purple-600 to-pink-600 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 py-24">
          <div className="text-center animate-movie-fade">
            <div className="flex justify-center mb-6">
              <Film className="w-16 h-16 animate-cinema-glow" />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 movie-gradient bg-clip-text text-transparent">
              Movie Theater
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200">
              Trải nghiệm điện ảnh đỉnh cao với shadcn/ui
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="gold" className="text-lg px-8">
                Đặt vé ngay
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 bg-white/10 border-white/30 hover:bg-white/20">
                Xem phim
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Components Demo Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">🎭 shadcn/ui Components Demo</h2>
          <p className="text-muted-foreground">Các components đã được customize cho Movie Theater</p>
        </div>

        {/* Search Section */}
        <div className="max-w-md mx-auto mb-12">
          <div className="flex gap-2">
            <Input placeholder="Tìm kiếm phim..." className="flex-1" />
            <Button variant="cinema">
              Tìm
            </Button>
          </div>
        </div>

        {/* Movie Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Movie Card 1 */}
          <MovieCard>
            <div className="aspect-[2/3] bg-gradient-to-br from-purple-500 to-pink-500 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <Film className="w-16 h-16 text-white/50" />
              </div>
              <div className="absolute top-4 left-4">
                <Badge variant="rating">9.5</Badge>
              </div>
              <div className="absolute top-4 right-4 flex gap-2">
                <Badge variant="imax">IMAX</Badge>
                <Badge variant="3d">3D</Badge>
              </div>
            </div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Avatar: The Way of Water
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              </CardTitle>
              <CardDescription>Hành trình khám phá thế giới Pandora</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="genre">Khoa học viễn tưởng</Badge>
                <Badge variant="genre">Phiêu lưu</Badge>
                <Badge variant="age">T13</Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  192 phút
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  2024
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button className="flex-1" variant="cinema">Đặt vé</Button>
              <Button variant="outline">Chi tiết</Button>
            </CardFooter>
          </MovieCard>

          {/* Movie Card 2 */}
          <MovieCard>
            <div className="aspect-[2/3] bg-gradient-to-br from-orange-500 to-red-500 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <Film className="w-16 h-16 text-white/50" />
              </div>
              <div className="absolute top-4 left-4">
                <Badge variant="rating">8.8</Badge>
              </div>
              <div className="absolute top-4 right-4">
                <Badge variant="vip">VIP</Badge>
              </div>
            </div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Top Gun: Maverick
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              </CardTitle>
              <CardDescription>Hành trình trở lại của phi công huyền thoại</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="genre">Hành động</Badge>
                <Badge variant="genre">Phiêu lưu</Badge>
                <Badge variant="age">T16</Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  131 phút
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  2024
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button className="flex-1" variant="cinema">Đặt vé</Button>
              <Button variant="outline">Chi tiết</Button>
            </CardFooter>
          </MovieCard>

          {/* Cinema Info Card */}
          <CinemaCard>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Rạp Galaxy Nguyễn Du
              </CardTitle>
              <CardDescription>Trung tâm thành phố</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm"><strong>Địa chỉ:</strong> 116 Nguyễn Du, Q1, TP.HCM</p>
                <p className="text-sm"><strong>Giờ mở cửa:</strong> 9:00 - 23:00</p>
                <p className="text-sm"><strong>Hotline:</strong> 1900-6420</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">Xem lịch chiếu</Button>
            </CardFooter>
          </CinemaCard>
        </div>

        {/* Button Variants Demo */}
        <div className="bg-card rounded-lg p-6 border">
          <h3 className="text-xl font-semibold mb-4">Button Variants</h3>
          <div className="flex flex-wrap gap-4">
            <Button>Default</Button>
            <Button variant="cinema">Cinema</Button>
            <Button variant="gold">Gold</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-cinema-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 Movie Theater Management System với shadcn/ui</p>
          <p className="text-sm text-gray-400 mt-2">Powered by NextJS 15, React 19, TailwindCSS v4</p>
        </div>
      </footer>
    </div>
  )
}
