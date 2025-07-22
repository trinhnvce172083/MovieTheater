"use client";

import { useEffect, useState } from "react";
import HomeContainer from "./HomeContainer";
import HomeLoading from "../loading";

export default function HomeClientWrapper() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <HomeLoading />;
  }

  return (
    <div key="home-client-wrapper">
      <HomeContainer />
    </div>
  );
}
