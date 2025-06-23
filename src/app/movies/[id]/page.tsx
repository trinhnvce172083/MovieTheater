"use client";

import React from "react";
import MovieDetailTemplate from "@/components/MovieDetails/MovieDetailTemplate";

interface MovieDetailPageProps {
  params: {
    id: string;
  };
}

export default function MovieDetailPage({ params }: MovieDetailPageProps) {
  return <MovieDetailTemplate movieId={params.id} />;
} 