"use client";

import React from "react";
import MovieDetailTemplate from "@/components/MovieDetails/MovieDetailTemplate";

interface MovieDetailPageProps {
  params: { id: string } | Promise<{ id: string }>;
}

export default function MovieDetailPage({ params }: MovieDetailPageProps) {
  // Hỗ trợ cả trường hợp params là Promise (Next.js 14+)
  const actualParams = typeof params.then === "function" ? React.use(params) : params;
  return <MovieDetailTemplate movieId={actualParams.id} />;
} 