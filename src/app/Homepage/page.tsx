"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, Typography, Spin } from "antd";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import ClientCarousel from "@/components/ClientCarousel";
import NOW_SHOWING from "@/constants/now_showing";
import UPCOMING from "@/constants/upcoming";
import PROMOTIONS from "@/constants/promotions";

const { Title, Text } = Typography;

type Movie = {
  id: number;
  title: string;
  posterUrl: string;
  releaseDate: string;
  genre: string;
  rating: string;
  description: string;
};

export default function Home() {
  const [nowShowingMovies, setNowShowingMovies] = useState<Movie[]>([]);
  const [upcomingMovies, setUpcomingMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const nowShowingRef = useRef<HTMLDivElement>(
    null
  ) as React.RefObject<HTMLDivElement>;
  const upcomingRef = useRef<HTMLDivElement>(
    null
  ) as React.RefObject<HTMLDivElement>;

  const scroll = (
    ref: React.RefObject<HTMLDivElement>,
    direction: "left" | "right"
  ) => {
    if (!ref.current) return;
    ref.current.scrollTo({
      left: ref.current.scrollLeft + (direction === "left" ? -300 : 300),
      behavior: "smooth",
    });
  };

  const formatReleaseDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });

  const NavButton = ({
    direction,
    onClick,
  }: {
    direction: "left" | "right";
    onClick: () => void;
  }) => (
    <Button
      variant="ghost"
      size="icon"
      className={`absolute top-1/2 -translate-y-1/2 rounded-full w-10 h-10 flex items-center justify-center z-10 shadow-md transition-colors ${
        direction === "left" ? "left-4" : "right-4"
      }`}
      style={{ backgroundColor: "rgba(255, 255, 255, 0.6)" }}
      onClick={onClick}
      onMouseOver={(e) =>
        (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.9)")
      }
      onMouseOut={(e) =>
        (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.6)")
      }
      aria-label={`Scroll ${direction}`}
    >
      {direction === "left" ? (
        <ChevronLeftIcon className="h-6 w-6" />
      ) : (
        <ChevronRightIcon className="h-6 w-6" />
      )}
    </Button>
  );

  const MovieCard = ({
    movie,
    isUpcoming = false,
  }: {
    movie: Movie;
    isUpcoming?: boolean;
  }) => (
    <div className="min-w-[280px] max-w-[280px] flex-shrink-0">
      <Card
        hoverable
        cover={
          <div className="h-[360px] relative">
            <Image
              src={movie.posterUrl}
              alt={movie.title}
              fill
              className="object-cover"
              sizes="(max-width: 300px) 100vw, 300px"
            />
          </div>
        }
        className="overflow-hidden h-full"
      >
        <Card.Meta
          title={movie.title}
          description={
            <div>
              <p className="text-gray-500">{movie.genre}</p>
              <p className="text-gray-500">
                {isUpcoming
                  ? `Coming ${formatReleaseDate(movie.releaseDate)}`
                  : movie.rating}
              </p>
            </div>
          }
        />
        {isUpcoming ? (
          <Button
            variant="outline"
            className="w-full mt-4 font-medium border-gray-300 hover:bg-gray-100 transition-colors"
          >
            Notify Me
          </Button>
        ) : (
          <Button
            asChild
            variant="ghost"
            className="w-full mt-4 border-none font-medium transition-all duration-300 
             bg-gradient-to-r from-blue-500 to-purple-500 py-2 px-4 rounded hover:from-purple-500 hover:to-blue-500 group"
          >
            <Link
              href={`/booking/${movie.id}`}
              className="flex items-center justify-center"
            >
              <span className="text-white group-hover:text-blue-200 transition-colors duration-300">
                Book Now
              </span>
            </Link>
          </Button>
        )}
      </Card>
    </div>
  );

  const MovieSection = ({
    title,
    movies,
    scrollRef,
    isUpcoming = false,
  }: {
    title: string;
    movies: Movie[];
    scrollRef: React.RefObject<HTMLDivElement>;
    isUpcoming?: boolean;
  }) => (
    <section className="mb-16 relative">
      <div className="flex justify-between items-center mb-8">
        <Title level={2} className="m-0">
          {title}
        </Title>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spin size="large" />
        </div>
      ) : movies.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          No {isUpcoming ? "upcoming" : "now showing"} movies
        </div>
      ) : (
        <div className="relative px-4">
          {movies.length > 4 && (
            <>
              <NavButton
                direction="left"
                onClick={() => scroll(scrollRef, "left")}
              />
              <NavButton
                direction="right"
                onClick={() => scroll(scrollRef, "right")}
              />
            </>
          )}
          <div
            ref={scrollRef}
            className="flex overflow-x-auto pb-4 gap-6 scroll-smooth no-scrollbar"
          >
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} isUpcoming={isUpcoming} />
            ))}
          </div>
        </div>
      )}
    </section>
  );

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const today = new Date();
        const allMovies = [...NOW_SHOWING, ...UPCOMING].flat();
        setTimeout(() => {
          setNowShowingMovies(
            allMovies.filter((m) => new Date(m.releaseDate) <= today)
          );
          setUpcomingMovies(
            allMovies.filter((m) => new Date(m.releaseDate) > today)
          );
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Error processing movies:", error);
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  return (
    <div className="flex flex-col min-h-screen w-full max-w-screen-2xl mx-auto px-4 md:px-8">
      {/* Promotional Carousel */}
      <section className="w-full mt-8 mb-16">
        <ClientCarousel autoplay effect="scrollx">
          {PROMOTIONS.map((promo) => (
            <div key={promo.id} className="h-[200px] relative">
              <div
                className={`absolute inset-0 ${promo.backgroundColor} rounded-lg overflow-hidden mx-4`}
              >
                <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white/80 to-transparent z-10"></div>
                <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white/80 to-transparent z-10"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-1/2 pl-16 z-20">
                    <Title level={2}>{promo.title}</Title>
                    <Text>{promo.description}</Text>
                  </div>
                  <div className="w-1/2 relative h-full">
                    <Image
                      src={promo.image}
                      alt={promo.title}
                      fill
                      className="object-contain px-10"
                      priority
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </ClientCarousel>
      </section>

      {/* Movie Sections */}
      <MovieSection
        title="Now Showing"
        movies={nowShowingMovies}
        scrollRef={nowShowingRef}
      />
      <MovieSection
        title="Coming Soon"
        movies={upcomingMovies}
        scrollRef={upcomingRef}
        isUpcoming={true}
      />
    </div>
  );
}
