//Homepage

import Image from "next/image";
import ClientCarousel from "@/components/ClientCarousel";

export default function Home() {
  return (
    <div className="grid grid-rows-[auto_1fr_20px] items-center justify-items-center min-h-screen p-8 gap-16">
      {/* Promotional Carousel */}
      <div className="w-full max-w-screen-xl row-start-1 mb-8">
        <ClientCarousel autoplay effect="scrollx">
          <div className="h-[280px] relative">
            <div className="absolute inset-0 bg-blue-100 rounded-lg overflow-hidden mx-4">
              {/* Gradient overlay for the left side */}
              <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white/80 to-transparent z-10"></div>
              {/* Gradient overlay for the right side */}
              <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white/80 to-transparent z-10"></div>
              
              <Image 
                src="/popcorn.jpg" 
                alt="Popcorn promotion" 
                fill={true}
                className="object-contain px-10"
                priority
              />
            </div>
          </div>
          <div className="h-[280px] relative">
            <div className="absolute inset-0 bg-blue-100 rounded-lg overflow-hidden mx-4">
              {/* Gradient overlay for the left side */}
              <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white/80 to-transparent z-10"></div>
              {/* Gradient overlay for the right side */}
              <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white/80 to-transparent z-10"></div>
              
              <Image 
                src="/drink.jpg" 
                alt="Drink promotion" 
                fill={true}
                className="object-contain px-10"
                priority
              />
            </div>
          </div>
          <div className="h-[280px] relative">
            <div className="absolute inset-0 bg-orange-100 rounded-lg overflow-hidden mx-4">
              {/* Gradient overlay for the left side */}
              <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white/80 to-transparent z-10"></div>
              {/* Gradient overlay for the right side */}
              <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white/80 to-transparent z-10"></div>
              
              <Image 
                src="/doraemon-banner.jpg" 
                alt="Voucher promotion" 
                fill={true}
                className="object-contain px-10" 
                priority
              />
            </div>
          </div>
        </ClientCarousel>
      </div>

      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <ol className="list-inside list-decimal text-sm/6 text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
          <li className="mb-2 tracking-[-.01em]">
            Get started by editing{" "}
            <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-[family-name:var(--font-geist-mono)] font-semibold">
              src/app/page.tsx
            </code>
            .
          </li>
          <li className="tracking-[-.01em]">
            Save and see your changes instantly.
          </li>
        </ol>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Deploy now
          </a>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read our docs
          </a>
        </div>
      </main>
    </div>
  );
}
