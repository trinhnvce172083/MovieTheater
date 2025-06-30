import React from "react";
import MovieDetailTemplate from "@/components/MovieDetails/MovieDetailTemplate";

type Params = Promise<{ id: string }>;

export default function MovieDetailPage(props: {
  params: Params;
}) {
  const params = React.use(props.params);
  const movieId = params.id;

  return <MovieDetailTemplate movieId={movieId} />;
}
