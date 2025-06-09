"use client";

import React from "react";
import Image from "next/image";

interface MoviePosterProps {
  src?: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

const MoviePoster: React.FC<MoviePosterProps> = ({
  src,
  alt,
  width = 100,
  height = 140,
  className = ""
}) => {
  return (
    <div 
      className={`bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className="object-cover w-full h-full"
        />
      ) : (
        <span className="text-gray-500 text-xs text-center px-2">
          Movie Poster
        </span>
      )}
    </div>
  );
};

export default MoviePoster; 