"use client";

import { useEffect, useState } from "react";
import NowShowingContainer from "./NowShowingContainer";
import NowShowingLoading from "../loading";

export default function NowShowingClientWrapper() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <NowShowingLoading />;
  }

  return (
    <div key="nowshowing-client-wrapper">
      <NowShowingContainer />
    </div>
  );
}
