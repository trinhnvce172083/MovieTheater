import { Suspense } from "react";
import { Metadata } from "next";
import Loading from "./loading";
import LoginClientWrapper from "./components/LoginClientWrapper";

export const metadata: Metadata = {
  title: "Login | Lumiere Cinema",
  description: "Sign in to your Lumiere Cinema account",
  robots: "noindex, nofollow",
  keywords: ["login", "sign in", "authentication", "cinema", "lumiere"],
};

export default function LoginPage() {
  return (
    <Suspense fallback={<Loading />}>
      <LoginClientWrapper />
    </Suspense>
  );
}
