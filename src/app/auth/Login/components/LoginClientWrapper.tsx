"use client";

import { useEffect, useState } from "react";
import LoginContainer from "./LoginContainer";
import Loading from "../loading";

export default function LoginClientWrapper() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <Loading />;
  }

  return (
    <div key="login-client-wrapper">
      <LoginContainer />
    </div>
  );
}
