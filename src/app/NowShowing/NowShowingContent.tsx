import { Suspense } from "react";
import NowShowingClientWrapper from "./components/NowShowingClientWrapper";
import NowShowingLoading from "./loading";

export default function NowShowingContent() {
  return (
    <Suspense fallback={<NowShowingLoading />}>
      <NowShowingClientWrapper />
    </Suspense>
  );
}
