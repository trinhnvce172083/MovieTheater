"use client";

import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Login page error:", error);
  }, [error]);

  return (
    <div className="min-h-screen h-screen flex items-center justify-center p-2 sm:p-4 md:p-8 lg:p-12">
      <Card
        className="w-full gap-0 max-w-sm sm:max-w-md md:max-w-md lg:max-w-md shadow-lg p-2 sm:p-4 rounded-xl"
        style={{ background: "#F8F6F3", backdropFilter: "blur(8px)" }}
      >
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <AlertCircle className="h-16 w-16 text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Something went wrong!
            </h1>
            <p className="text-gray-600 mb-4">
              We encountered an error while loading the login page.
            </p>
          </div>
          <div className="space-y-2">
            <Button
              onClick={reset}
              className="w-full"
              variant="default"
            >
              Try again
            </Button>
            <Button
              onClick={() => window.location.href = "/"}
              className="w-full"
              variant="outline"
            >
              Go to Home
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}