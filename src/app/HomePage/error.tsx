"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home, RefreshCw } from "lucide-react";

export default function HomeError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Homepage error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <AlertCircle className="h-16 w-16 text-red-500" />
        </div>

        <h1 className="text-white text-2xl md:text-3xl font-bold mb-4">
          Something went wrong!
        </h1>

        <p className="text-gray-300 mb-8">
          We encountered an error while loading the homepage. Please try again.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={reset}
            className="flex items-center gap-2"
            variant="default"
          >
            <RefreshCw size={16} />
            Try Again
          </Button>

          <Button
            onClick={() => (window.location.href = "/")}
            className="flex items-center gap-2"
            variant="outline"
          >
            <Home size={16} />
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}
