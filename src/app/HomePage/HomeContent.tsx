import { Suspense } from "react";
import HomeClientWrapper from "./components/HomeClientWrapper";
import HomeLoading from "./loading";

export default function HomeContent() {
  return (
    <Suspense fallback={<HomeLoading />}>
      <HomeClientWrapper />
    </Suspense>
  );
}
