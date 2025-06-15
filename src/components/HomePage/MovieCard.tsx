import React from "react";
import Image from "next/image";
import { Movie } from "@/types/HomePage/movie";
import { Card } from "antd";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const formatReleaseDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });

export default function MovieCard({
  movie,
  isUpcoming = false,
}: {
  movie: Movie;
  isUpcoming?: boolean;
}): React.ReactElement {
  return (
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
}
