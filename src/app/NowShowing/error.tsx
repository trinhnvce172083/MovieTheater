"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle } from "lucide-react";

export default function NowShowingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("NowShowing page error:", error);
  }, [error]);

  return (
    <div className="container mx-auto py-4 sm:py-6 lg:py-8 mt-16 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <div className="bg-red-950/20 border border-red-900/50 rounded-lg p-6 sm:p-8 max-w-md mx-auto">
          <AlertCircle className="h-12 w-12 sm:h-16 sm:w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
            Something went wrong!
          </h2>
          <p className="text-orange-200 text-sm sm:text-base mb-6 leading-relaxed">
            We encountered an error while loading the movies. Please try again.
          </p>
          <Button
            onClick={reset}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}
